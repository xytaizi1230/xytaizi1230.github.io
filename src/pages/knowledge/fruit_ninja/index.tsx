import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

/* =========================================
   配置常量
   ========================================= */
const CONFIG = {
  SAFETY_MARGIN: 0.05, // 边缘防误触
  GRAVITY: -0.015,     // 重力 (加大重力，使下落感更强)
  BLADE: {
    baseWidth: 1.2,   // 刀光最大宽度 (加宽)
    length: 20,       // 拖尾长度 (加长，使挥动更有弧度感)
    color: 0xffffff,  // 纯白刀光
    opacity: 0.9      // 不透明度
  },
  GAME: {
    INITIAL_SPAWN_RATE: 80, // 初始生成间隔(帧)
    MIN_SPAWN_RATE: 20,
    EMOJI_SCALE: 5.5, // Emoji 再次放大
  }
};

const EMOJIS = {
  FRUIT: ['🍉', '🍊', '🍎', '🍌', '🥥', '🍍', '🥝', '🍓', '🍑'],
  POOP: ['💩'],
  BOMB: ['💣']
};

/* =========================================
   工具函数
   ========================================= */

const createEmojiTexture = (emoji: string) => {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '180px "Segoe UI Emoji", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(emoji, 128, 138);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

const createTextSprite = (text: string, color: string = '#fff', fontSize: number = 60) => {
  if (typeof document === 'undefined') return new THREE.Sprite();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, 256, 64);
  }
  const map = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: map });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 1.5, 1);
  return sprite;
};

// 音频管理器 (修复报错版)
class AudioManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  play(type: 'slice' | 'fruit' | 'poop' | 'bomb' | 'combo', comboCount = 0) {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    // FIX: 使用 0.01 代替 0，避免 exponentialRampToValueAtTime 报错
    const MIN_VAL = 0.01;

    switch (type) {
      case 'slice':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(MIN_VAL, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      case 'fruit':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(MIN_VAL, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'combo':
        osc.type = 'square';
        const baseFreq = 440 + (comboCount * 50);
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * 2, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(MIN_VAL, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      case 'poop':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.4);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(MIN_VAL, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      case 'bomb':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(10, t + 0.8);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(MIN_VAL, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.8);
        break;
    }
  }
}

/* =========================================
   React 组件
   ========================================= */

const FruitNinjaGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skeletonCanvasRef = useRef<HTMLCanvasElement>(null);

  const audioManager = useRef(new AudioManager());
  const requestRef = useRef<number>();
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const stateRef = useRef<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');

  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const objectsRef = useRef<any[]>([]);
  const bladeMeshRef = useRef<THREE.Mesh>();
  const bladePathRef = useRef<THREE.Vector3[]>([]);
  const historyScoresRef = useRef<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [comboMsg, setComboMsg] = useState('');

  // 初始化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let handLandmarker: any = null;
    let cleanup = false;

    const initAI = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (navigator.mediaDevices && videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            if (!cleanup) {
              setLoading(false);
              initThreeJS();
              startGameLoop(handLandmarker);
            }
          };
        }
      } catch (e) {
        console.error("AI Init Error:", e);
      }
    };

    const initThreeJS = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      const frustumSize = 20;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2, frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / -2,
        0.1, 100
      );
      camera.position.z = 10;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // --- 刀光几何体 (三角形带) ---
      const bladeGeo = new THREE.BufferGeometry();
      // 顶点数量：Length * 2 (左右) * 3 (XYZ)
      const positions = new Float32Array(CONFIG.BLADE.length * 2 * 3);
      bladeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const bladeMat = new THREE.MeshBasicMaterial({
        color: CONFIG.BLADE.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: CONFIG.BLADE.opacity,
        depthTest: false // 确保刀光在最上层
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.frustumCulled = false;
      bladeMeshRef.current = blade;
      scene.add(blade);

      createMenuUI();
    };

    initAI();
    audioManager.current.init();
    const saved = localStorage.getItem('fn_scores');
    if (saved) historyScoresRef.current = JSON.parse(saved);

    return () => {
      cleanup = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  const createMenuUI = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    objectsRef.current = objectsRef.current.filter(o => {
      if (o.type === 'ui') { scene.remove(o.mesh); return false; }
      return true;
    });

    const title = stateRef.current === 'MENU' ? '🍉 虚拟水果忍者' : '游戏结束';
    const titleMesh = createTextSprite(title, '#fff', 80);
    titleMesh.position.set(0, 4, 0);
    scene.add(titleMesh);
    objectsRef.current.push({ mesh: titleMesh, type: 'ui', tag: 'static' });

    const btnEmoji = stateRef.current === 'MENU' ? '▶️' : '🔄';
    const btnTex = createEmojiTexture(btnEmoji);
    const btnMat = new THREE.SpriteMaterial({ map: btnTex });
    const btn = new THREE.Sprite(btnMat);
    btn.scale.set(3, 3, 1);
    btn.position.set(0, 0, 0);
    scene.add(btn);

    objectsRef.current.push({
      mesh: btn, type: 'ui', tag: stateRef.current === 'MENU' ? 'START' : 'RESTART',
      active: true, radius: 1.5
    });

    if (historyScoresRef.current.length > 0) {
      const scoreStr = `Top 3: ${historyScoresRef.current.join(' | ')}`;
      const scoreMesh = createTextSprite(scoreStr, '#aaa', 40);
      scoreMesh.position.set(0, -4, 0);
      scene.add(scoreMesh);
      objectsRef.current.push({ mesh: scoreMesh, type: 'ui', tag: 'static' });
    }
  };

  const resetGame = () => {
    scoreRef.current = 0;
    setCurrentScore(0);
    comboRef.current = 0;
    stateRef.current = 'PLAYING';

    const scene = sceneRef.current;
    objectsRef.current.forEach(o => scene?.remove(o.mesh));
    objectsRef.current = [];
    spawnRateRef.current = CONFIG.GAME.INITIAL_SPAWN_RATE;
  };

  const handleSlice = (obj: any, index: number) => {
    if (obj.type === 'ui') {
      audioManager.current.play('slice');
      resetGame();
      return;
    }

    obj.active = false;
    sceneRef.current?.remove(obj.mesh);
    objectsRef.current.splice(index, 1);

    if (obj.type === 'fruit') {
      comboRef.current++;
      let points = 10;
      if (comboRef.current > 1) {
        points += comboRef.current * 2;
        audioManager.current.play('combo', comboRef.current);
        setComboMsg(`${comboRef.current} COMBO!`);
        setTimeout(() => setComboMsg(''), 800);
      } else {
        audioManager.current.play('fruit');
      }
      scoreRef.current += points;
    } else if (obj.type === 'poop') {
      comboRef.current = 0;
      scoreRef.current -= 20;
      audioManager.current.play('poop');
    } else if (obj.type === 'bomb') {
      scoreRef.current -= 100;
      audioManager.current.play('bomb');
    }

    setCurrentScore(Math.max(0, scoreRef.current));

    if (scoreRef.current <= 0 && stateRef.current === 'PLAYING') {
      scoreRef.current = 0;
      stateRef.current = 'GAMEOVER';
      let newHistory = [Math.max(0, scoreRef.current), ...JSON.parse(localStorage.getItem('fn_scores') || '[]')];
      newHistory = newHistory.slice(0, 3);
      historyScoresRef.current = newHistory;
      localStorage.setItem('fn_scores', JSON.stringify(newHistory));
      createMenuUI();
    }
  };

  const spawnRateRef = useRef(CONFIG.GAME.INITIAL_SPAWN_RATE);
  const spawnTimerRef = useRef(0);

  const startGameLoop = (handLandmarker: any) => {
    let lastVideoTime = -1;
    const loop = () => {
      const now = performance.now();

      if (videoRef.current && videoRef.current.currentTime !== lastVideoTime) {
        lastVideoTime = videoRef.current.currentTime;
        const results = handLandmarker.detectForVideo(videoRef.current, now);
        drawSkeleton(results);

        if (results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const indexFinger = landmarks[8];
          const x = 1.0 - indexFinger.x;
          const y = 1.0 - indexFinger.y;

          if (x > CONFIG.SAFETY_MARGIN && x < 1 - CONFIG.SAFETY_MARGIN &&
            y > CONFIG.SAFETY_MARGIN && y < 1 - CONFIG.SAFETY_MARGIN) {
            updateBlade(x, y);
            checkCollisions();
          } else {
            decayBlade();
          }
        } else {
          decayBlade();
        }
      }

      updateGameLogic();

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const drawSkeleton = (results: any) => {
    const ctx = skeletonCanvasRef.current?.getContext('2d');
    const canvas = skeletonCanvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [0, 9, 10, 11, 12], [0, 13, 14, 15, 16], [0, 17, 18, 19, 20]].forEach(idx => {
          ctx.moveTo(landmarks[idx[0]].x * canvas.width, landmarks[idx[0]].y * canvas.height);
          for (let i = 1; i < idx.length; i++)
            ctx.lineTo(landmarks[idx[i]].x * canvas.width, landmarks[idx[i]].y * canvas.height);
        });
        ctx.stroke();
      }
    }
  };

  // --- 刀光逻辑核心修改 ---
  const updateBlade = (screenX: number, screenY: number) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;

    // 映射到世界坐标
    const worldPos = new THREE.Vector3(
      (screenX * 2 - 1) * (cam.right - cam.left) / 2,
      (screenY * 2 - 1) * (cam.top - cam.bottom) / 2,
      0
    );

    // 平滑插值：如果移动太快，可以在两帧之间补点，这里为了性能直接 Unshift
    bladePathRef.current.unshift(worldPos);

    // 限制长度
    if (bladePathRef.current.length > CONFIG.BLADE.length) {
      bladePathRef.current.pop();
    }
    constructBladeGeometry();
  };

  const decayBlade = () => {
    if (bladePathRef.current.length > 0) {
      bladePathRef.current.pop();
      // 没手的时候消失得快一点
      if (bladePathRef.current.length > 0) bladePathRef.current.pop();
      constructBladeGeometry();
    }
  };

  // 构造“新月形”刀光
  const constructBladeGeometry = () => {
    const mesh = bladeMeshRef.current;
    if (!mesh) return;

    const path = bladePathRef.current;
    const positions = mesh.geometry.attributes.position.array as Float32Array;
    const len = path.length;

    if (len < 2) {
      // 隐藏
      for (let i = 0; i < positions.length; i++) positions[i] = 0;
      mesh.geometry.attributes.position.needsUpdate = true;
      return;
    }

    let pIndex = 0;
    // 使用 Catmull-Rom 插值可以让曲线更圆滑，但为了性能和锐利感，这里使用线性连接 + 宽度调制
    for (let i = 0; i < len - 1; i++) {
      const curr = path[i];
      const next = path[i + 1];

      const dir = new THREE.Vector3().subVectors(next, curr).normalize();
      // 法向量
      const normal = new THREE.Vector3(-dir.y, dir.x, 0);

      // --- 关键修改：计算宽度 ---
      // 头部(i=0)很尖，中间宽，尾部(i=len)很尖
      // 使用正弦波的一部分：0 -> PI
      const progress = i / (len - 1);
      // Math.sin(0) = 0, Math.sin(PI/2) = 1, Math.sin(PI) = 0
      const widthFactor = Math.sin(progress * Math.PI);

      // 稍微偏置一下，让头部更锐利一点，尾部稍微胖一点点消散
      // 或者直接用标准的纺锤形，效果最像截图
      const width = CONFIG.BLADE.baseWidth * widthFactor;

      normal.multiplyScalar(width * 0.5);

      // 顶点
      positions[pIndex++] = curr.x + normal.x;
      positions[pIndex++] = curr.y + normal.y;
      positions[pIndex++] = 0;

      positions[pIndex++] = curr.x - normal.x;
      positions[pIndex++] = curr.y - normal.y;
      positions[pIndex++] = 0;
    }

    // 处理剩余的 buffer
    while (pIndex < positions.length) {
      positions[pIndex++] = positions[pIndex - 4] || 0;
    }

    mesh.geometry.attributes.position.needsUpdate = true;
  };

  const updateGameLogic = () => {
    if (stateRef.current !== 'PLAYING') return;

    spawnTimerRef.current++;
    if (spawnTimerRef.current > spawnRateRef.current) {
      spawnTimerRef.current = 0;
      const batchSize = Math.min(1 + Math.floor(scoreRef.current / 80), 5);
      spawnRateRef.current = Math.max(CONFIG.GAME.MIN_SPAWN_RATE, spawnRateRef.current - 1);

      for (let i = 0; i < batchSize; i++) {
        setTimeout(() => spawnObject(), i * 150);
      }
    }

    for (let i = objectsRef.current.length - 1; i >= 0; i--) {
      const obj = objectsRef.current[i];
      if (obj.type !== 'ui') {
        obj.mesh.position.add(obj.velocity);
        obj.velocity.y += CONFIG.GRAVITY;
        obj.mesh.material.rotation += obj.rotSpeed;

        if (obj.mesh.position.y < -15) {
          sceneRef.current?.remove(obj.mesh);
          objectsRef.current.splice(i, 1);
        }
      }
    }
  };

  // --- 物理逻辑修正：确保飞到中心 ---
  const spawnObject = () => {
    if (!sceneRef.current || !cameraRef.current) return;
    const cam = cameraRef.current;

    // 1. 发射点：屏幕底部边缘，X轴随机
    const startX = (Math.random() - 0.5) * (cam.right - cam.left) * 0.9;
    const startY = cam.bottom - 2;

    // 2. 目标高度：至少到达屏幕中心，最高到屏幕上边缘的80%
    const screenHeight = cam.top - cam.bottom;
    const minHeight = screenHeight * 0.5; // 至少一半
    const maxHeight = screenHeight * 0.8;
    // 目标相对于发射点的垂直距离 (h)
    const targetH = (minHeight + Math.random() * (maxHeight - minHeight)) - startY;

    // 3. 垂直初速度 (Vy)：根据能量守恒 v = sqrt(2 * g * h)
    // 注意 gravity 是负数，所以取绝对值
    const velY = Math.sqrt(2 * Math.abs(CONFIG.GRAVITY) * targetH);

    // 4. 水平初速度 (Vx)：确保到达最高点附近时，位于屏幕中心区域
    // 上升时间 t = vy / g
    const timeToPeak = velY / Math.abs(CONFIG.GRAVITY);
    // 目标 X 位置：向屏幕中心(0)靠拢，稍微带点随机偏移
    const targetX = (Math.random() - 0.5) * 5; // -2.5 到 2.5 之间
    const velX = (targetX - startX) / timeToPeak;

    const r = Math.random();
    let type = 'fruit';
    let emoji = EMOJIS.FRUIT[Math.floor(Math.random() * EMOJIS.FRUIT.length)];

    if (r < 0.15) { type = 'bomb'; emoji = EMOJIS.BOMB[0]; }
    else if (r < 0.3) { type = 'poop'; emoji = EMOJIS.POOP[0]; }

    const texture = createEmojiTexture(emoji);
    const mat = new THREE.SpriteMaterial({ map: texture });
    const mesh = new THREE.Sprite(mat);

    mesh.scale.set(CONFIG.GAME.EMOJI_SCALE, CONFIG.GAME.EMOJI_SCALE, 1);
    mesh.position.set(startX, startY, 0);

    sceneRef.current.add(mesh);
    objectsRef.current.push({
      mesh,
      type,
      velocity: new THREE.Vector3(velX, velY, 0),
      rotSpeed: (Math.random() - 0.5) * 0.15,
      active: true,
      radius: 2.5
    });
  };

  const checkCollisions = () => {
    if (bladePathRef.current.length < 2) return;
    const tip = bladePathRef.current[0];

    for (let i = objectsRef.current.length - 1; i >= 0; i--) {
      const obj = objectsRef.current[i];
      if (!obj?.active) continue;
      const dist = tip.distanceTo(obj.mesh.position);
      if (dist < obj.radius) {
        handleSlice(obj, i);
      }
    }
  };

  return (
    <div ref={containerRef} style={{
      position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'radial-gradient(circle at center, #1a237e 0%, #000000 100%)',
      cursor: 'none', userSelect: 'none'
    }}>
      {loading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'white', fontSize: '24px' }}>正在加载...</div>}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#ffeb3b', fontSize: '40px', fontWeight: 'bold', textShadow: '2px 2px 0 #000', zIndex: 5, fontFamily: 'Arial' }}>Score: {currentScore}</div>
      {comboMsg && <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', color: '#ff9800', fontSize: '60px', fontWeight: '900', textShadow: '0 0 10px white', animation: 'pop 0.2s ease-out', zIndex: 6 }}>{comboMsg}</div>}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '240px', height: '180px', border: '4px solid #333', borderRadius: '10px', background: '#000', overflow: 'hidden', zIndex: 5, boxShadow: '0 0 15px rgba(0,255,255,0.3)' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        <canvas ref={skeletonCanvasRef} width={240} height={180} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }} />
      </div>
    </div>
  );
};

export default FruitNinjaGame;