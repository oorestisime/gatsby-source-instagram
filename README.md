<div align="center">
<h1>reobin's version of gatsby-source-instagram</h1>

[![npm version](https://badge.fury.io/js/gatsby-source-instagram.svg)](https://badge.fury.io/js/gatsby-source-instagram)
![npm](https://img.shields.io/npm/dw/gatsby-source-instagram.svg)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/oorestisime/gatsby-source-instagram.svg)](https://isitmaintained.com/project/oorestisime/gatsby-source-instagram "Average time to resolve an issue")
![NPM](https://img.shields.io/npm/l/gatsby-source-instagram.svg)

</div>

Source plugin for sourcing data from Instagram. There are three ways to get information from instagram:

- scraping the homepage of the Instagram account. It can only get last 12 photos.
- scraping a hashtag page.
- querying the Instagram Graph Api using a provided `access_token`

# Table of Contents

- [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [How to use](#how-to-use)
    - [Public scraping](#public-scraping)
    - [Graph API](#graph-api)
    - [Hashtag scraping](#hashtag-scraping)
  - [How to query](#how-to-query)
  - [Image processing](#image-processing)
  - [Instagram Graph API token](#instagram-graph-api-token)

## Install

`npm install --save gatsby-source-instagram`

## How to use

### Public scraping

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

### Graph API

If you intend to use the Instagram Graph Api then you need to pass the instagram id and an access token

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      username: `username`,
      access_token: "a valid access token",
      instagram_id: "your instagram_business_account id",
    },
  },
]
```

Passing the username in this case is optional. If the Graph Api throws any exception and the username is provided then it will use the public scraping method as a fallback.

### Hashtag scraping

If you want to source nodes from hashtags then you need the following:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      type: `hashtag`,
      hashtag: `snowing`,
    },
  },
]
```

## How to query

The plugin tries to provide uniform results regardless of the way you choose to retrieve the information

Common fields include:

- id
- likes
- original
- timestamp
- comments
- caption
- username (fallbacks to the hashtag name in case of hashtag scraping)
- preview
- mediaType

The public scraping method can additionaly retrieve:

- thumbnails
- dimensions

```graphql
query {
  allInstaNode {
    edges {
      node {
        id
        likes
        comments
        mediaType
        preview
        original
        timestamp
        caption
        localFile {
          childImageSharp {
            fixed(width: 150, height: 150) {
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

## Instagram Graph API token

[Special thanks to LekoArts](https://github.com/LekoArts)

1. You need to have a Facebook page (I know... :/)
1. Go to your site settings -> Instagram -> Login into your Instagram account
1. Create a [app](https://developers.facebook.com/apps/)
1. Go to the [Graph API Explorer][gae]
   1. Select your App from the top right dropdown menu
   1. Select "Get User Access Token" from dropdown (right of access token field) and select needed permissions (manage_pages, pages_show_list, instagram_basic)
   1. Copy user access token
1. [Access Token Debugger][atd]:
   1. Paste copied token and press "Debug"
   1. Press "Extend Access Token" and copy the generated long-lived user access token
1. [Graph API Explorer][gae]:
   1. Paste copied token into the "Access Token" field
   1. Make a GET request with "PAGE_ID?fields=access_token"
   1. Find the permanent page access token in the response (node "access_token")
1. [Access Token Debugger][atd]:
   1. Paste the permanent token and press "Debug"
   1. "Expires" should be "Never"
   1. Copy the **access token**
1. [Graph API Explorer][gae]:
   1. Make a GET request with "PAGE_ID?fields=instagram_business_account" to get your **Business ID**
