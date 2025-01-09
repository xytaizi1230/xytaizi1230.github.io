import * as React from "react"
import { navigate } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/Layout"
import Seo from "../components/SeoSSR"
import * as styles from "../styles/index.module.scss"

export const Head = () => <Seo title="Home" />

const IndexPage = () => {
  const linkOnClick = ({ target }: any) => {
    navigate(target.dataset.to)
  }

  return (
    <Layout>
      <h1 className={styles.title}>
        <StaticImage
          src="../images/avatar.webp"
          loading="eager"
          width={64}
          quality={95}
          formats={["auto", "webp", "avif"]}
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
        <div data-to="/markdown" data-desc="打工人的知识点" onClick={linkOnClick}>
          随记
        </div>
        <div data-to="/knowledge" data-desc="打工人的知识点" onClick={linkOnClick}>
          卷卷
        </div>
        <div data-to="/bored" data-desc="无聊了来摸摸鱼" onClick={linkOnClick}>
          摸摸鱼
        </div>
        <div data-to="/game" data-desc="very very good" onClick={linkOnClick}>好玩的</div>
      </div>
    </Layout>
  )
}

export default IndexPage
