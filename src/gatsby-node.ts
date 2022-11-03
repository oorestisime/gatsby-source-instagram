import _ from "lodash"

import { downloadMediaFile } from "./normalize"
import { apiInstagramPosts, scrapingInstagramPosts } from "./instagram"

import type { GatsbyNode } from "gatsby"

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

function createPostNode(datum, params) {
  return {
    username: datum.username || datum.owner.username || datum.owner.id,
    id: datum.shortcode,
    parent: `__SOURCE__`,
    internal: {
      type: `InstaNode`,
    },
    children: [],
    likes:
      _.get(datum, `edge_liked_by.count`) ||
      _.get(datum, `edge_media_preview_like.count`) ||
      datum.like_count,
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
    hashtags: datum.hashtags,
    permalink: datum.permalink,
    carouselImages: _.get(datum, `children.data`, []).map((imgObj) => {
      return {
        preview: imgObj.media_url,
        ...imgObj,
      }
    }),
  }
}

function processDatum(datum, params) {
  const node = createPostNode(datum, params) // Get content digest of node. (Required field)

  const contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(node))
    .digest(`hex`)
  node.internal.contentDigest = contentDigest
  return node
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async (
  { actions, store, cache, createNodeId },
  options
) => {
  const { createNode, touchNode } = actions
  const params = { ...defaultOptions, ...options }
  let data

  data = await getInstagramPosts(params)

  if (data) {
    Promise.all(
      data.map(async (datum) => {
        const res = await downloadMediaFile({
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
