const _ = require(`lodash`)
const axios = require(`axios`)
const cheerio = require(`cheerio`)
const crypto = require(`crypto`)
const normalize = require(`./normalize`)

async function getPublicInstagramPosts({ username }) {
  return axios
    .get(`https://www.instagram.com/${username}/`)
    .then(response => {
      // handle success
      const $ = cheerio.load(response.data)
      const jsonData = $(`html > body > script`)
        .get(0)
        .children[0].data.replace(/window\._sharedData\s?=\s?{/, `{`)
        .replace(/;$/g, ``)
      const json = JSON.parse(jsonData).entry_data.ProfilePage[0].graphql
      const photos = []
      json.user.edge_owner_to_timeline_media.edges.forEach(edge => {
        if (edge.node) {
          photos.push(edge.node)
        }
      })
      return photos
    })
    .catch(err => {
      console.warn(`\nCould not fetch instagram posts. Error status ${err}`)
      return null
    })
}

async function getInstagramPosts({ access_token, instagram_id, username }) {
  return axios
    .get(
      `https://graph.facebook.com/v3.1/${instagram_id}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count&limit=100&access_token=${access_token}`
    )
    .then(async response => {
      let results = []
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
      console.warn(`Falling back to public api... with ${username}`)
      if (username) {
        const photos = await getPublicInstagramPosts({
          username,
        })
        return photos
      }
      return null
    })
}

function processDatum(datum) {
  const node = {
    id: datum.shortcode,
    parent: `__SOURCE__`,
    internal: {
      type: `InstaNode`,
    },
    children: [],
    likes: _.get(datum, "edge_liked_by.count") || datum.like_count,
    caption:
      _.get(datum, "edge_media_to_caption.edges[0].node.text") || datum.caption,
    thumbnails: datum.thumbnail_resources,
    mediaType: datum.__typename || datum.media_type,
    preview: datum.display_url || datum.thumbnail_url || datum.media_url,
    original: datum.display_url || datum.media_url,
    timestamp:
      datum.taken_at_timestamp || new Date(datum.timestamp).getTime() / 1000,
    dimensions: datum.dimensions,
    comments:
      _.get(datum, "edge_media_to_comment.count") || datum.comments_count,
  }

  // Get content digest of node. (Required field)
  const contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(node))
    .digest(`hex`)

  node.internal.contentDigest = contentDigest
  return node
}

exports.sourceNodes = async (
  { actions, store, cache, createNodeId },
  options
) => {
  const { createNode, touchNode } = actions

  let data
  if (options.access_token && options.instagram_id) {
    data = await getInstagramPosts(options)
  } else {
    data = await getPublicInstagramPosts(options)
  }

  // Process data into nodes.
  if (data) {
    return Promise.all(
      data.map(async datum => {
        const res = await normalize.downloadMediaFile({
          datum: processDatum(datum),
          store,
          cache,
          createNode,
          createNodeId,
          touchNode,
        })
        createNode(res)
      })
    )
  }
}
