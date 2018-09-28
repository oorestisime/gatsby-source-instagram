# gatsby-source-instagram [![npm version](https://badge.fury.io/js/gatsby-source-instagram.svg)](https://badge.fury.io/js/gatsby-source-instagram)

Source plugin for scraping data from instagram public profiles and creating
nodes providing their id, all thumbnails available, original image, their likes count,
and a localFile to use the sharp plugin.
Since it uses the public website without any api keys, the plugin can only get
last 12 photos posted.

## Install

`npm install --save gatsby-source-instagram`

## How to use

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

## How to query

Get all posts with the preview image ID and the author's name:

```graphql
query {
  allInstaNode {
    edges {
      node {
        id
        likes {
          count
        }
        thumbnails {
          src
          config_width
          config_height
        }
        original
        timestamp
        dimensions {
          height
          width
        }
        localFile {
          childImageSharp {
            fixed(width: 150, height:150) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    }
  }
}
```

## Image processing

To use image processing you need gatsby-transformer-sharp, gatsby-plugin-sharp and their dependencies gatsby-image and gatsby-source-filesystem in your gatsby-config.js.

You can apply image processing on each instagram node. To access image processing in your queries you need to use the localFile on the **InstaNode** as shown above:
