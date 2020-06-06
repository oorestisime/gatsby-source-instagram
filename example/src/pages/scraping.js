import React from "react"
import { graphql } from "gatsby"
import { Layout, Container } from "../components"

const IndexPage = ({ data: { allInstaNode } }) => (
  <Layout>
    <Container
      title="Public scraping"
      text="Using public scraping you are able to retrieve the last 12 posts of
      an Instagram account without using an access token."
      nodes={allInstaNode}
    />
  </Layout>
)

export const pageQuery = graphql`
  query ScrapingQuery {
    allInstaNode(filter: { username: { eq: "25025320" } }) {
      edges {
        node {
          id
          username
          likes
          caption
          comments
          localFile {
            childImageSharp {
              fluid(quality: 70, maxWidth: 600, maxHeight: 600) {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
      }
    }
  }
`

export default IndexPage
