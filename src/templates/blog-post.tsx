import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/Layout"
import SEO from "../components/SEO"

import * as styles from "../styles/blog.module.scss"

// previous
// next
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

interface BlogProps extends GlobalGraphql {
  pageContext: {
    previous?: {
      slug: string
      title: string
    }
    next?: {
      slug: string
      title: string
    }
  }
}

export default (props: BlogProps) => {
  const { data, pageContext, } = props
  const { previous, next } = pageContext

  const post = data.markdownRemark

  return (
    <Layout>
      <SEO title={post?.frontmatter.title} description={post?.frontmatter.desc} />
      <div>
        <h1>{post?.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post?.html ?? '' }} />
      </div>
      <div className={styles.footer}>
        <div>
          {previous ? <Link to={previous.slug}>{previous.title}</Link> : null}
        </div>
        <div>
          {next ? <Link to={next.slug}>{next.title}</Link> : null}
        </div>
      </div>
    </Layout>
  )
}
