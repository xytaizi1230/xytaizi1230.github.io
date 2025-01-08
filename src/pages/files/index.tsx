import React from "react"
import { graphql } from "gatsby"
import Layout from "../../components/Layout"
import * as Styles from "./index.module.scss"

export const query = graphql`
  query MyQuery {
  allFile(sort: {modifiedTime: DESC}) {
    edges {
      node {
        id
        name
        modifiedTime(formatString: "YYYY-MM-DD HH:mm:ss")
        base
        birthTime(formatString: "YYYY-MM-DD HH:mm:ss")
        changeTime(formatString: "YYYY-MM-DD HH:mm:ss")
        extension
        prettySize
      }
    }
  }
}
`

export default ({ data }: { data: GraphqlDate }) => {
  console.log("🚀 cjc - data:", data)

  return (
    <Layout>
      <div className={Styles.filesContainer}>
        <h1>My Site's Files</h1>
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>prettySize</th>
              <th>extension</th>
              <th>birthTime</th>
            </tr>
          </thead>
          <tbody>
            {data.allFile?.edges.map(({ node }, index) => (
              <tr key={index}>
                <td>{node.name}</td>
                <td>{node.prettySize}</td>
                <td>{node.extension}</td>
                <td>{node.birthTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
