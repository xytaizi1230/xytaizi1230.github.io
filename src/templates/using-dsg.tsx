import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/Layout"
import Seo from "../components/Seo"

const UsingDSG = () => (
  <Layout>
    <h1>
      来自<b>DSG Page</b>的问候
    </h1>
    <p>只有在用户请求时才会创建此页面。</p>
    <p>
      要了解更多信息，请参阅&nbsp;
      <a href="https://www.gatsbyjs.com/docs/reference/rendering-options/deferred-static-generation/">
        有关延迟静态生成的文档
      </a>
      .
    </p>
    <Link to="/">返回主页</Link>
  </Layout>
)

export const Head = () => <Seo title="Using DSG" />

export default UsingDSG
