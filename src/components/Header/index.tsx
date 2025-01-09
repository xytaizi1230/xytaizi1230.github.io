import * as React from "react"
import { Link } from "gatsby"
import Logo from "../../images/favicon-32x32.png"
import * as styles from "./index.module.scss"

const Header = ({ siteTitle }: { siteTitle: string }) => (
  <header
    className={styles.header}
  >
    <Link
      to="/"
      style={{
        fontSize: `var(--font-sm)`,
        textDecoration: `none`,
      }}
    >
      {siteTitle}
    </Link>
    <img
      alt="logo"
      height={20}
      style={{ margin: 0 }}
      src={Logo}
    />
  </header>
)

export default Header
