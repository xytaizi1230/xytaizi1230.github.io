/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */
const { createFilePath } = require(`gatsby-source-filesystem`)

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  createPage({
    path: "/using-dsg",
    component: require.resolve("./src/templates/using-dsg.tsx"),
    context: {},
    defer: true,
  })

  const result = await graphql(`
query MyQuery {
  allMarkdownRemark(
    sort: {frontmatter: {date: DESC}}
    filter: {fields: {slug: {regex: "/markdown/"}}}
  ) {
    edges {
      node {
        id
        fields {
          slug
        }
        excerpt
        frontmatter {
          title
          date(formatString: "YYYYY-MM-DD")
          desc
        }
      }
      next {
        fields {
          slug
        }
        frontmatter {
          title
        }
      }
      previous {
        fields {
          slug
        }
        frontmatter {
          title
        }
      }
    }
  }
}`)

  const posts = result.data.allMarkdownRemark.edges
  // 为所有的markdown文件创建路由
  posts.forEach(({ node, next, previous }) => {
    createPage({
      path: node.fields.slug,
      component: require.resolve("./src/templates/blog-post.tsx"),
      context: {
        // 传递给上下文的可用数据
        // 可在页面查询中作为GraphQL变量
        slug: node.fields.slug,
        // 上一份内容和下一份的简略信息
        previous: previous ? { title: previous.frontmatter.title, slug: previous.fields.slug } : undefined,
        next: next ? { title: next.frontmatter.title, slug: next.fields.slug } : undefined,
      },
    })
  })
}

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const filePath = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: filePath,
    })
  }
}
