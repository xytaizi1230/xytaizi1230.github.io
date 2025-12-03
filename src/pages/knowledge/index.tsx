import React from "react"
import { Link } from "gatsby"
import Layout from "@/components/Layout"
import Seo from "@/components/SeoSSR"

export const Head = () => <Seo title="卷卷" description="某人间歇性发奋图强时留下的痕迹;WEB;Node.js;程序员;" />

// export default ({ data }: { data: GraphqlDate }) => (
export default () => (
  <Layout>
    <div>
      <h1>也不知道这人到底在卷什么</h1>
      <br />
      <div key="1">
        <h3 style={{ marginBottom: 12 }}>
          <Link to="fruit_ninja">水果忍者</Link>
          &nbsp;
          <span style={{ color: '#bbb' }}>
            —2025-12-03 14:32:34
          </span>
        </h3>
        <p>借助gemini3.0 pro实现的网页游戏;只有基本的逻辑，想要通过简单模糊的指令就让ai实现一个完善的应用还是不太可能，哈哈</p>
      </div>
    </div>
  </Layout >
)