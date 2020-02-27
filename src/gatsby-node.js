const _ = require(`lodash`)
const crypto = require(`crypto`)
const normalize = require(`./normalize`)
const {
  apiInstagramPosts,
  scrapingInstagramPosts,
  apiInstagramHashtags,
  scrapingInstagramHashtags,
  scrapingInstagramUser,
} = require(`./instagram`)

const defaultOptions = {
  type: `account`,
  paginate: 100,
}

async function getInstagramPosts(options) {
  let data
  if (options.access_token && options.instagram_id) {
    data = await apiInstagramPosts(options)
  } else {
    data = await scrapingInstagramPosts(options)
  }
  return data
}

async function getInstagramHashtags(options) {
  let data
  if (options.access_token && options.instagram_id) {
    data = await apiInstagramHashtags(options)
  } else {
    data = await scrapingInstagramHashtags(options)
  }
  return data
}

async function getInstagramUser(options) {
  const data = await scrapingInstagramUser(options)
  return [data]
}

function createPostNode(datum, params) {
  return {
    type: params.type,
    username:
      params.type === `hashtag`
        ? params.hashtag
        : datum.username || datum.owner.username,
    id: datum.shortcode,
    parent: `__SOURCE__`,
    internal: {
      type: `InstaNode`,
    },
    children: [],
    likes: _.get(datum, `edge_liked_by.count`) || datum.like_count,
    caption:
      _.get(datum, `edge_media_to_caption.edges[0].node.text`) || datum.caption,
    thumbnails: datum.thumbnail_resources,
    mediaType: datum.__typename || datum.media_type,
    preview: datum.display_url || datum.thumbnail_url || datum.media_url,
    original: datum.display_url || datum.media_url,
    timestamp:
      datum.taken_at_timestamp || new Date(datum.timestamp).getTime() / 1000,
    dimensions: datum.dimensions,
    comments:
      _.get(datum, `edge_media_to_comment.count`) || datum.comments_count,
  }
}

function createUserNode(datum, params) {
  return {
    type: params.type,
    id: datum.id,
    full_name: datum.full_name,
    biography: datum.biography,
    edge_followed_by: datum.edge_followed_by,
    edge_follow: datum.edge_follow,
    profile_pic_url: datum.profile_pic_url,
    profile_pic_url_hd: datum.profile_pic_url_hd,
    username: datum.username,
    internal: {
      type: `InstaUserNode`,
    },
  }
}

function processDatum(datum, params) {
  const node =
    params.type === `user-profile`
      ? createUserNode(datum, params)
      : createPostNode(datum, params)

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
  const params = { ...defaultOptions, ...options }

  let data
  if (params.type === `account`) {
    data = await getInstagramPosts(params)
  } else if (params.type === `hashtag`) {
    data = await getInstagramHashtags(params)
  } else if (params.type === `user-profile`) {
    data = await getInstagramUser(params)
  } else {
    console.warn(`Unknown type for gatsby-source-instagram: ${params.type}`)
  }

  // Process data into nodes.
  if (data) {
    return Promise.all(
      data.map(async datum => {
        const res = await normalize.downloadMediaFile({
          datum: processDatum(datum, params),
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
