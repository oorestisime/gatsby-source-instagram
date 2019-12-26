/* eslint-disable camelcase */
const axios = require(`axios`)
const cheerio = require(`cheerio`)

const parseResponse = response => {
  const $ = cheerio.load(response.data)
  const scripts = $(`html > body > script`)
  // Code smells #40 and #42
  // I should verify why i get the script before the body tag
  let id = 0
  if (scripts.get(0).attribs.type === `application/ld+json`) {
    id = 1
  }
  const jsonData = $(`html > body > script`)
    .get(id)
    .children[0].data.replace(/window\._sharedData\s?=\s?{/, `{`)
    .replace(/;$/g, ``)
  return JSON.parse(jsonData).entry_data
}

export async function scrapingInstagramPosts({ username }) {
  return axios
    .get(`https://www.instagram.com/${username}/`)
    .then(response => {
      const data = parseResponse(response)
      const photos = []
      data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.forEach(
        edge => {
          if (edge.node) {
            photos.push(edge.node)
          }
        }
      )
      return photos
    })
    .catch(err => {
      console.warn(`\nCould not fetch instagram posts. Error status ${err}`)
      return null
    })
}

export async function scrapingInstagramHashtags({ hashtag }) {
  return axios
    .get(`https://www.instagram.com/explore/tags/${hashtag}/`)
    .then(response => {
      const data = parseResponse(response)
      const photos = []
      data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges.forEach(
        edge => {
          if (edge.node) {
            photos.push(edge.node)
          }
        }
      )
      return photos
    })
    .catch(err => {
      console.warn(
        `\nCould not fetch instagram posts from hashtag. Error status ${err}`
      )
      return null
    })
}

export async function scrapingInstagramUser({ username }) {
  return axios
    .get(`https://www.instagram.com/${username}/`)
    .then(response => {
      const data = parseResponse(response)
      const { user } = data.ProfilePage[0].graphql
      const infos = {
        id: user.id,
        full_name: user.full_name,
        biography: user.biography,
        edge_followed_by: user.edge_followed_by,
        edge_follow: user.edge_follow,
        profile_pic_url: user.profile_pic_url,
        profile_pic_url_hd: user.profile_pic_url_hd,
        username: user.username,
      }
      return infos
    })
    .catch(err => {
      console.warn(`\nCould not fetch instagram user. Error status ${err}`)
      return null
    })
}

export async function apiInstagramPosts({
  access_token,
  instagram_id,
  username,
  limit = 100
}) {
  return axios
    .get(
      `https://graph.facebook.com/v3.1/${instagram_id}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count,username&limit=${limit}&access_token=${access_token}`
    )
    .then(async response => {
      const results = []
      results.push(...response.data.data)
      while (response.data.paging.next) {
        response = await axios(response.data.paging.next)
        results.push(...response.data.data)
      }
      return results
    })
    .catch(async err => {
      console.warn(
        `\nCould not get instagram posts using the Graph API. Error status ${err}`
      )
      console.warn(`Falling back to public scraping... with ${username}`)
      if (username) {
        const photos = await scrapingInstagramPosts({
          username,
        })
        return photos
      }
      return null
    })
}
