import * as React from "react"
import { Link } from "gatsby"
import Seo from "../components/SeoSSR"

export const Head = () => <Seo title="404: Not Found" />

const NotFoundPage = () => (
  <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <h1>404</h1>
    <p>你发现了一条没人走过的路</p>
    <Link to="/">返回主页</Link>
  </div>
)

export default NotFoundPage
