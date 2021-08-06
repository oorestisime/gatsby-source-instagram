import React from "react"
import { graphql } from "gatsby"
import { Layout, Container } from "../components"

const IndexPage = ({ data: { allInstaNode } }) => (
  <Layout>
    <Container
      title="Graph API"
      text="The graph API allows you to pull in all the available Instagram
    posts from a specific account using an access token"
      nodes={allInstaNode}
    />
  </Layout>
)

export const pageQuery = graphql`
  query IndexQuery {
    allInstaNode(filter: { username: { eq: "oasome.blog" } }) {
      edges {
        node {
          id
          username
          likes
          caption
          comments
          # hashtags
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
