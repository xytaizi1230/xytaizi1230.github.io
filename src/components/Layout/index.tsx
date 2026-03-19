import { Outlet } from "react-router";
import styles from "./index.module.scss";

const Layout = () => (
  <div className={styles.layout}>
    <main className={styles.container}>
      <Outlet />
    </main>
    <footer
      className={styles.footer}
      style={{
        marginTop: `var(--space-5)`,
        fontSize: `var(--font-sm)`,
      }}
    >
      <div>
        <a href="https://xytaizi1230.github.io">&copy;xytaizi1230</a>
      </div>
      <div>{new Date().toLocaleString()}</div>
    </footer>
  </div>
);
export default Layout;
