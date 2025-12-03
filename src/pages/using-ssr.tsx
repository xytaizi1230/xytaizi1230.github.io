import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/Layout"
import Seo from "../components/SeoSSR"

const UsingSSR = ({ serverData }: GlobalGraphql) => {
  console.log("🚀 cjc - UsingSSR - serverData:", serverData)
  return (
    <Layout>
      <h1>
        此页面由 <b>服务端渲染</b>
      </h1>
      <p>
        每次请求此页面时，页面都会在服务器端重新渲染。刷新页面即可查看另一张随机照片：&nbsp;
        <code>dog.ceo/api/breed/shiba/images/random</code>:
      </p>
      <img
        style={{ width: "320px", borderRadius: "var(--border-radius)" }}
        alt="A random dog"
        src={serverData.message}
      />
      <p>
        要了解更多信息，请前往&nbsp;
        <a href="https://www.gatsbyjs.com/docs/reference/rendering-options/server-side-rendering/">
          服务端渲染文档
        </a>
        .
      </p>
      <Link to="/">返回首页</Link>
    </Layout>
  )
}

export const Head = () => <Seo title="Using SSR" />

export default UsingSSR

export async function getServerData() {
  // 这里的log会在终端输出
  try {
    const res = await fetch(`https://dog.ceo/api/breed/shiba/images/random`)
    if (!res.ok) {
      throw new Error(`Response failed`)
    }
    return {
      // props会映射到serverData上
      props: await res.json(),
    }
  } catch (error) {
    return {
      status: 500,
      headers: {},
      props: {},
    }
  }
}
