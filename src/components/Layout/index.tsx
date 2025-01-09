/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Header from "../Header"
import * as styles from './index.module.scss'
import "./layout.css"

const Layout = ({ children }: { children: any }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      </div>
      <main className={styles.container}>
        {children}
      </main>
      <footer
        className={styles.footer}
        style={{
          marginTop: `var(--space-5)`,
          fontSize: `var(--font-sm)`,
        }}
      >
        <div><a href="https://xytaizi1230.github.io">&copy;xytaizi1230</a></div>
        <div>
          {new Date().toLocaleString()}
        </div>
        <div>
          ???
        </div>
      </footer>
    </div>
  )
}

export default Layout
