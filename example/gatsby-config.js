require(`dotenv`).config()

module.exports = {
  siteMetadata: {
    title: `gatsby-source-instagram-exaple`,
    author: `@oorestisime`,
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-sharp`,
    // {
    //   // For development
    //   // resolve: `..`,
    //   resolve: `gatsby-source-instagram`,
    //   options: {
    //     username: `oasome.blog`,
    //     access_token: process.env.IG_ACCESS_TOKEN,
    //     instagram_id: `17841408507179516`,
    //     paginate: 20,
    //     maxPosts: 30,
    //     hashtags: true,
    //   },
    // },
    {
      // For development
      resolve: `..`,
      // resolve: `gatsby-source-instagram`,
      options: {
        username: `25025320`,
      },
    },
    // {
    //   // For development
    //   resolve: `..`,
    //   // resolve: `gatsby-source-instagram`,
    //   options: {
    //     type: `hashtag`,
    //     hashtag: `snowing`,
    //   },
    // },
    // {
    //   // For development
    //   resolve: `..`,
    //   // resolve: `gatsby-source-instagram`,
    //   options: {
    //     type: `user-profile`,
    //     username: `oasome.blog`,
    //   },
    // },
  ],
}
