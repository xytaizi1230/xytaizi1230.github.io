import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"
import Seo from "../components/SeoSSR"

export const query = graphql`
  query MyQuery {
  allMarkdownRemark(
  sort: {frontmatter: {date: DESC}}
  filter: {fields: {slug: {regex: "/markdown/"}}}
  ) {
    edges {
      node {
        id
        html
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY-MM-DD HH:mm:ss",locale: "zh-CN")
          title
          desc
        }
        excerpt
      }
    }
    totalCount
  }
}
`
export const Head = () => <Seo title="某人的奇怪知识点" description="某人的奇怪知识点;开发知识点;知识点;开发踩坑;" />

export default ({ data }: { data: GraphqlDate }) => (
  <Layout>
    <div>
      <h1>
        某人的奇怪知识点
        <em style={{ marginLeft: "3em", fontSize: 16, fontWeight: 400 }}>共{data.allMarkdownRemark?.totalCount}篇文章</em>
      </h1>
      <br />
      {data.allMarkdownRemark?.edges.map(({ node }) => (
        <div key={node.id}>
          <h3
            style={{
              marginBottom: 12,
            }}
          >
            <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
            &nbsp;
            <span
              style={{
                color: '#bbb',
              }}
            >
              — {node.frontmatter.date}
            </span>
          </h3>
          <p>{node.frontmatter?.desc ?? '--'}</p>
        </div>
      ))}
    </div>
  </Layout >
)