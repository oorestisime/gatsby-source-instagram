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
        fixed {
          src
          srcSet
          width
          height
        }
      }
    }
  }
}
```

## Lazy loading

This plugin handles creating src and srcSets to co-work with gastby-image and provide lazy loading.
For the moment only fixed sizes are available and those are not generated but calculated
from the available thumbnails and original image. This avoids recreating the thumbnails
and conserving the image quality.

**fixed** can take 1 parameter its width. It defaults to the original image

* The height is calculated automatically based on the selected width.

## Ideas

* Get the original image and save it locally while generating multiple fixed and fluid sizes for better integration with gatsby-image
* Cache images locally to avoid querying instagram for the images when user visiting website
