/* eslint-disable camelcase */
const axios = require(`axios`)

export async function scrapingInstagramPosts({ username }) {
  return axios
    .get(`https://www.instagram.com/${username}/?__a=1`)
    .then(response => {
      console.log(response.data)
      const photos = []
      response.data.graphql.user.edge_owner_to_timeline_media.edges.forEach(
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
    .get(`https://www.instagram.com/explore/tags/${hashtag}/?__a=1`)
    .then(response => {
      const photos = []
      response.data.graphql.hashtag.edge_hashtag_to_media.edges.forEach(
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
    .get(`https://www.instagram.com/${username}/?__a=1`)
    .then(response => {
      const { user } = response.data.graphql
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
  paginate = `100`,
  maxPosts,
}) {
  return axios
    .get(
      `https://graph.facebook.com/v3.1/${instagram_id}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count,username&limit=${paginate}&access_token=${access_token}`
    )
    .then(async response => {
      const results = []
      results.push(...response.data.data)
      // if maxPosts option specified, then check if there is a next field in the response data and the results' length <= maxPosts
      // otherwise, fetch as more as it can
      while (
        maxPosts
          ? response.data.paging.next && results.length <= maxPosts
          : response.data.paging.next
      ) {
        response = await axios(response.data.paging.next)
        results.push(...response.data.data)
      }
      return maxPosts ? results.slice(0, maxPosts) : results
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
