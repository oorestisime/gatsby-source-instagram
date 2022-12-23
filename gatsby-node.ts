import _ from "lodash"
import { downloadMediaFile } from "./normalize"
import { apiInstagramPosts, scrapingInstagramPosts } from "./instagram"

import type { GatsbyNode, NodePluginArgs } from "gatsby"
import type {
  GatsbyInstagramNode,
  Options,
  RawInstagramNode,
} from "./types/options"

const defaultOptions = {
  type: "account",
  paginate: "100",
}

async function getInstagramPosts(options: Options) {
  let data

  if (options.access_token && options.instagram_id) {
    data = await apiInstagramPosts(options)
  } else {
    data = await scrapingInstagramPosts(options.username)
  }

  return data
}

function createPostNode(
  datum: RawInstagramNode,
  createContentDigest: NodePluginArgs["createContentDigest"]
): GatsbyInstagramNode {
  console.log("DATUM", datum)

  return {
    username: datum.username || datum.owner.username || datum.owner.id,
    id: datum.shortcode,
    parent: `__SOURCE__`,
    internal: {
      type: `InstaNode`,
      contentDigest: createContentDigest(datum),
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
    // Known problem with this field.  It's an array of raw nodes here, but later mutated to Gatsby nodes with createRemoteFileNode
    //@ts-ignore
    carouselImages: _.get(datum, `children.data`, []).map(
      (imgObj: RawInstagramNode) => {
        return {
          ...imgObj,
          preview: imgObj.media_url,
        }
      }
    ),
  }
}

function processDatum(
  datum: RawInstagramNode,
  createContentDigest: NodePluginArgs["createContentDigest"]
) {
  const node = createPostNode(datum, createContentDigest) // Get content digest of node. (Required field)

  return node
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async (
  { actions, cache, createNodeId, createContentDigest },
  options
) => {
  const { createNode, touchNode } = actions
  const params = { ...defaultOptions, ...options }
  let data

  data = await getInstagramPosts(params)

  if (data) {
    Promise.all(
      data.map(async (datum: RawInstagramNode) => {
        const res = await downloadMediaFile({
          datum: processDatum(datum, createContentDigest),
          cache,
          createNode,
          createNodeId,
          touchNode,
        })
        console.log(res)

        createNode({ ...res, id: createNodeId(`InstaNode-${res.permalink}`) })
      })
    )
  }
}
