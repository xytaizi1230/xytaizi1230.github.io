import { NavLink } from "react-router";
import Logo from "../../assets/avatar.webp";
import styles from "./index.module.scss";

const IndexPage = () => {
  return (
    <>
      <meta name="description" content="密斯卡乌斯卡" />
      <h1 className={styles.title}>
        <img
          src={Logo}
          loading="eager"
          width={64}
          style={{ borderRadius: "8px" }}
          alt="Logo"
        />
        <p>
          欢迎来到 <b>妙妙屋!</b>
        </p>
      </h1>
      <div className={styles.intro}>
        <b>这里有以下内容:</b>
      </div>
      <div className={styles.textCenter}>
        <NavLink className={styles.navLink} to="/markdown" title="打工人的知识点">
          随记
        </NavLink>
        <NavLink className={styles.navLink} to="/knowledge" title="到底在卷什么呢">
          卷卷
        </NavLink>
        <NavLink className={styles.navLink} to="/bored" title="无聊了来摸摸鱼">
          摸摸鱼
        </NavLink>
        <NavLink className={styles.navLink} to="/game" title="very very good">
          好玩的
        </NavLink>
        <NavLink className={styles.navLink} to="/using-ssr" title="using-ssr">
          using-ssr
        </NavLink>
        <NavLink
          className={styles.navLink}
          to="/using-typescript"
          title="using-typescript"
        >
          using-typescript
        </NavLink>
      </div>
    </>
  );
};

export default IndexPage;
