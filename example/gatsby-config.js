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
    {
      resolve: `gatsby-source-instagram`,
      options: {
        username: `oasome.blog`,
        access_token: process.env.IG_ACCESS_TOKEN,
        instagram_id: `17841408507179516`,
      },
    },
    {
      resolve: `gatsby-source-instagram`,
      options: {
        username: `instagram`,
      },
    },
    {
      resolve: `..`,
      options: {
        type: `hashtag`,
        hashtag: `snowing`,
      },
    },
  ],
}
