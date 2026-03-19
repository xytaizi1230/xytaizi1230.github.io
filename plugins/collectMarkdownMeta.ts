import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "front-matter";

interface MatterData {
  title: string;
  date: string;
  desc: string;
}

// 适配 Vite 的 ESModule 路径（替代 __dirname）
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 自定义 Vite 插件：收集 markdown 目录文件信息
function collectMarkdownMeta() {
  return {
    name: "collect-markdown-meta",
    // 构建时/开发时都执行，生成文件信息
    async buildStart() {
      const postsDir = path.resolve(__dirname, "../src/assets/markdown"); // 你的 MD 文件目录
      const publicDir = path.resolve(__dirname, "../public");

      try {
        // 1. 读取目录下的所有 MD 文件
        const files = await fs.readdir(postsDir);
        const mdFiles = files.filter((file) => file.endsWith(".md"));

        // 2. 收集文件信息（名称、路径、修改时间等）
        const postsMeta = await Promise.all(
          mdFiles.map(async (file) => {
            const filePath = path.join(postsDir, file);
            const stats = await fs.stat(filePath); // 获取文件元信息

            // 读取文件内容
            const fileContent = await fs.readFile(filePath, "utf8");
            // 解析 Frontmatter
            const parsed = matter<MatterData>(fileContent);

            return {
              id: file.replace(".md", ""), // 去掉后缀作为 ID
              filename: file,
              lastModified: stats.mtime.toISOString(), // 最后修改时间
              size: stats.size, // 文件大小（可选）
              title: parsed.attributes.title || "无标题", // 提取 title，兜底
              date: parsed.attributes.date || stats.birthtime.toISOString(), // 提取 date，兜底
              desc: parsed.attributes.desc || "无描述", // 提取 desc，兜底
            };
          })
        );

        // 3. 写入 public 目录（前端可通过 /posts-meta.json 访问）
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(
          path.join(publicDir, "markdown-meta.json"),
          JSON.stringify(postsMeta, null, 2)
        );

        console.log("✅ 已生成文章列表元信息：public/posts-meta.json");
      } catch (err) {
        console.error("❌ 收集文章信息失败：", err);
      }
    },
  };
}

export default collectMarkdownMeta;
