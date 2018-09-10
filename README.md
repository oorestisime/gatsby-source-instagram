# gatsby-source-instagram

Source plugin for scraping data from instagram public profiles and creating
nodes providing their id, all thumbnails available and their likes count.
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
        thumbnails {
          src
          config_width
          config_height
        }
        likes {
          count
        }
      }
    }
  }
}
```
