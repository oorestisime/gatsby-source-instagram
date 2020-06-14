// import React from "react"
// import { graphql } from "gatsby"
// import { Layout, Container } from "../components"

// const IndexPage = ({ data: { allInstaNode } }) => (
//   <Layout>
//     <Container
//       title="Hashtag public scraping"
//       text="Using hashtag public scraping you are able to retrieve the last posts of a hashtag page"
//       nodes={allInstaNode}
//     />
//   </Layout>
// )

// export const pageQuery = graphql`
//   query HashtagQuery {
//     allInstaNode(filter: { type: { eq: "hashtag" } }) {
//       edges {
//         node {
//           id
//           username
//           likes
//           caption
//           comments
//           localFile {
//             childImageSharp {
//               fluid(quality: 70, maxWidth: 600, maxHeight: 600) {
//                 ...GatsbyImageSharpFluid_withWebp
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `

// export default IndexPage
