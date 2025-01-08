import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/Layout"


export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date
      }
    }
  }
`

export default ({ data }: { data: GraphqlDate }) => {
  const post = data.markdownRemark

  return (
    <Layout>
      <div>
        <h1>{post?.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post?.html ?? '' }} />
      </div>
    </Layout>
  )
}
