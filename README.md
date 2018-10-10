# gatsby-source-instagram [![npm version](https://badge.fury.io/js/gatsby-source-instagram.svg)](https://badge.fury.io/js/gatsby-source-instagram)

Source plugin for getting data from Instagram. There are two ways to get information from profiles

* scraping the homepage of the Instagram account. It can only get last 12 photos.
* querying the Instagram Graph Api using a provided access_token

## Install

`npm install --save gatsby-source-instagram`

## How to use

If you intend to use the public scraping method then you need to pass the concerning username

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      username: `username`,
    },
  },
]
```

If you intend to use the Instagram Graph Api then you need to pass the instagram id and an access token

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      username: `username`,
      access_token: 'a valid access token',
      instagram_id: 'your instagram_business_account id',
    },
  },
]
```

To generate access token follow this guide https://developers.facebook.com/docs/instagram-api/getting-started

You can use this tool to get your instagram account id https://developers.facebook.com/tools/explorer

Passing the username in this case is optional. If the Graph Api throws any exception and the username is provided then it will use the public scraping method as a fallback.

## How to query

The plugin tries to provide uniform results regardless of the way you choose to retrieve the information

Common fields include:

* id
* likes
* original
* timestamp
* comments

The public scraping method can additionaly retrieve:

* thumbnails
* dimensions

```graphql
query {
  allInstaNode {
    edges {
      node {
        id
        likes
        comments
        original
        timestamp
        localFile {
          childImageSharp {
            fixed(width: 150, height:150) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        # Only available with the public api scraper
        thumbnails {
          src
          config_width
          config_height
        }
        dimensions {
          height
          width
        }
      }
    }
  }
}
```

## Image processing

To use image processing you need gatsby-transformer-sharp, gatsby-plugin-sharp and their dependencies gatsby-image and gatsby-source-filesystem in your gatsby-config.js.

You can apply image processing on each instagram node. To access image processing in your queries you need to use the localFile on the **InstaNode** as shown above:


# Changelog

## v0.2.0
### Added
* Add ability to query using the Instagram Graph API

### Breaking changes
* You no longer access likes using `node.likes.count`, but `node.likes`.
