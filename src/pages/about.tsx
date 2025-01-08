import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/Layout"


// 执行查询语句后会在文件默认导出的函数中接收查询结果作为参数【data】
export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default ({ data }: { data: any }) => (
  <Layout>
    <h1>About {data.site.siteMetadata.title}</h1>
    <p>
      We're the only site running on your computer dedicated to showing the best
      photos and videos of pandas eating lots of food.
    </p>
  </Layout>
)
