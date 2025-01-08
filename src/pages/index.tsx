import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/Layout"
import Seo from "../components/Seo"
import * as styles from "../styles/index.module.scss"
import { url } from "inspector"

const samplePageLinks = [
  {
    url: '/markdown/2/',
    text: '第二篇文章',
  },
  {
    url: '/markdown/1/',
    text: '第一篇文章',
  }
]

const IndexPage = () => (
  <Layout>
    <div className={styles.textCenter}>
      <StaticImage
        src="../filesystem/images/example.png"
        loading="eager"
        width={64}
        quality={95}
        formats={["auto", "webp", "avif"]}
        style={{ marginBottom: `var(--space-3)` }}
        alt="Logo"
      />
      <h1>
        Welcome to <b>Gatsby!</b>
      </h1>
      <div className={styles.intro}>
        <b>Example pages:</b>
        <ul>

          {samplePageLinks.map((link, i) => (
            <li key={link.url}>
              <Link to={link.url}>{link.text}</Link>
              {i !== samplePageLinks.length - 1 && <> · </>}
            </li>
          ))}
        </ul>


      </div>
    </div>
  </Layout>
)

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="Home" />

export default IndexPage
