<div align="center">
<h1>gatsby-source-instagram</h1>

[![npm version](https://badge.fury.io/js/gatsby-source-instagram.svg)](https://badge.fury.io/js/gatsby-source-instagram)
![npm](https://img.shields.io/npm/dw/gatsby-source-instagram.svg)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/oorestisime/gatsby-source-instagram.svg)](https://isitmaintained.com/project/oorestisime/gatsby-source-instagram "Average time to resolve an issue")
![NPM](https://img.shields.io/npm/l/gatsby-source-instagram.svg)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c2fe26e3-7ba1-47a8-a399-17a02a301658/deploy-status)](https://app.netlify.com/sites/gatsby-src-instagram/deploys)

</div>

Source plugin for sourcing data from Instagram. There are four ways to get information from instagram:

- scraping the posts of an Instagram account. It can only get last 50 photos.
- scraping a hashtag page.
- scraping a user profile's informations.
- querying the Instagram Graph Api using a provided `access_token`

# Table of Contents

- [Install](#install)
- [How to use](#how-to-use)
  - [Public scraping for posts](#public-scraping-for-posts)
  - [Public scraping for a user's profile](#public-scraping-for-a-users-profile)
  - [Graph API](#graph-api)
  - [Hashtag scraping](#hashtag-scraping)
- [How to query](#how-to-query)
  - [Posts](#posts)
  - [User profile information](#user-profile-information)
- [Image processing](#image-processing)
- [Instagram Graph API token](#instagram-graph-api-token)

## Install

`npm install --save gatsby-source-instagram`

## How to use

### Public scraping for posts

If you intend to use the public scraping method then you need to pass the concerning username id.
You can determine it by taking the following steps:
1. Open a browser and go to the Instagram page of the user – e.g. https://www.instagram.com/oasome.blog/
1. Right-click on the web page to open the right-click context menu and select Page Source / View page source / Show Page Source. Safari users, please make sure that the developer tools are enabled – see [Enabling Web Inspector - Apple Developer](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/Web_Inspector_Tutorial/EnableWebInspector/EnableWebInspector.html)
1. Search for `profilePage_`. The number that follows is the username id. If you view the page source of https://www.instagram.com/oasome.blog/, you will find `profilePage_8556131572`. So, `8556131572` is the username id of the username `oasome.blog`.

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      username: `usernameId`,
    },
  },
]
```

### Public scraping for a user's profile

** Deprecated **

Due to instagram adding a login screen for scraping calls this is no longer working on Cloud builders.
I am currently researching a solution, ideas and PRs welcome.

If you want to source a user's profile from their username then you need the following:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      type: `user-profile`,
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
      paginate: 100,
      maxPosts: 1000,
      hashtags: true
    },
  },
]
```

Passing the username in this case is optional. If the Graph Api throws any exception and the username is provided then it will use the public scraping method as a fallback.

The `paginate` parameter will influence the limit set for the api call (defaults to 100) and the `maxPosts` enables to limit the maximum number of posts we will store. Defaults to undefined.

The `hashtag` parameter can be set to true which will also grab the hashtags from the first 3 comments by default. If you'd like to change the number of comments to check for hashtags you can pass an object like below. Defaults to false.

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-instagram`,
    options: {
      username: `username`,
      access_token: "a valid access token",
      instagram_id: "your instagram_business_account id",
      hashtags: {
        enabled: true,
        commentDepth: 10
      }
    },
  },
]

```

### Hashtag scraping

** Deprecated **

Due to instagram adding a login screen for scraping calls this is no longer working on Cloud builders.
I am currently researching a solution, ideas and PRs welcome.

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

### Posts

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
- permalink
- carouselImages

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
        hashtags
        localFile {
          childImageSharp {
            fixed(width: 150, height: 150) {
              ...GatsbyImageSharpFixed
            }
          }
        },
        permalink,
        carouselImages {
          preview,
          localFile {
          childImageSharp {
            fixed(width: 150, height: 150) {
              ...GatsbyImageSharpFixed
            }
          }
        },
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

### User profile information

** Deprecated **

Due to instagram adding a login screen for scraping calls this is no longer working on Cloud builders.
I am currently researching a solution, ideas and PRs welcome.

Fields include:

- id
- username
- full_name
- biography
- edge_followed_by (followers)
- edge_follow (who the user follows)
- profile_pic_url
- profile_pic_url_hd

```graphql
query {
  instaUserNode {
    id
    username
    full_name
    biography
    edge_followed_by
    edge_follow
    profile_pic_url
    profile_pic_url_hd
  }
}
```

## Image processing

To use image processing you need gatsby-transformer-sharp, gatsby-plugin-sharp and their dependencies gatsby-image and gatsby-source-filesystem in your gatsby-config.js.

You can apply image processing on each instagram node. To access image processing in your queries you need to use the localFile on the **InstaNode** as shown above:

## Instagram Graph API token

** Disclaimer: ** These steps might not be clear, or not exactly working for everybody. Working on updated or automated steps right now. Progress is at https://github.com/oorestisime/gatsby-source-instagram/issues/24
Any help on this side is greatly welcomed and appreciated!

1. You need to have a Facebook page (I know... :/)
1. Go to your site settings -> Instagram -> Login into your Instagram account
1. Create a [app](https://developers.facebook.com/apps/)
1. Go to the [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   1. Make sure you are using v7 as api version
   1. Select your facebook app
   1. Click "Generate Access Token"
   1. Add the following permissions (pages_manage_ads, pages_manage_metadata, pages_read_engagement, pages_read_user_content, pages_show_list, instagram_basic)
   1. Make a GET request at `me/accounts`
   1. copy the access_token in the response (we call this **temporary_token**)
   1. click on the id to change the explorer url and append `?fields=instagram_business_account&access_token={access-token}`
   1. save your `instagram_business_account.id`, this is your **instagram_id**
1. [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/):
   1. Paste your temporary_token and press "Debug"
   1. You should see this token now expires in 3 months
   1. Press "Extend Access Token" and press the new debug that appears next to the token
   1. You should see this token now never expires
   1. Copy this new token (we will call this **access_token**)

With these two information you can now use the plugin as:

```
{
  resolve: `gatsby-source-instagram`,
  options: {
    username: username,
    access_token: access_token,
    instagram_id: instagram_id,
  },
},
```
