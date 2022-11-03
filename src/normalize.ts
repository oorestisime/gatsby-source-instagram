import { createRemoteFileNode } from "gatsby-source-filesystem"
import type { Actions, NodePluginArgs } from "gatsby"
import { GatsbyInstagramNode, RawInstagramNode } from "../types/options"

/**
 * Create file nodes to be used by gatsby image.
 * @param {object} agrugments - The good stuff.
 * @returns {number} fileNodeID - Unique identifier.
 */
const createFileNode = async ({
  id,
  preview,
  cache,
  createNode,
  createNodeId,
  touchNode,
}: {
  id: string
  preview: RawInstagramNode["preview"]
  cache: NodePluginArgs["cache"]
  createNode: Actions["createNode"]
  createNodeId: NodePluginArgs["createNodeId"]
  touchNode: Actions["touchNode"]
}) => {
  const mediaDataCacheKey = `instagram-media-${id}`
  const cacheMediaData = await cache.get(mediaDataCacheKey)
  let fileNodeID

  if (cacheMediaData) {
    fileNodeID = cacheMediaData.fileNodeID
    touchNode(cacheMediaData)
    return fileNodeID
  }

  try {
    const fileNode = await createRemoteFileNode({
      url: preview,
      cache,
      createNode,
      createNodeId,
    })
    fileNodeID = fileNode.id

    await cache.set(mediaDataCacheKey, { fileNodeID })
  } catch (error) {
    console.error(`Could not dowcreate remote file noden, error is: `, error)
  }

  return fileNodeID
}

/**
 * Download media files.
 * @param {object} agrugments - The good stuff.
 * @returns {object} datum - Media data.
 */
export const downloadMediaFile = async ({
  datum,
  cache,
  createNode,
  createNodeId,
  touchNode,
}: {
  datum: GatsbyInstagramNode
  cache: NodePluginArgs["cache"]
  createNode: Actions["createNode"]
  createNodeId: NodePluginArgs["createNodeId"]
  touchNode: Actions["touchNode"]
}): Promise<GatsbyInstagramNode> => {
  const { carouselImages, id, preview } = datum

  /** Create a file node for base image */
  const fileNodeID = await createFileNode({
    id,
    preview,
    cache,
    createNode,
    createNodeId,
    touchNode,
  })

  /** eslint-disable-next-line require-atomic-updates */
  if (fileNodeID) datum.localFile___NODE = fileNodeID

  /** If all we have is a single image stop here */
  if (!carouselImages.length) return datum

  /** Loop over all carousel images and create a local file node for each */
  for (let i = 0; i < carouselImages.length; i++) {
    const { id: imgId, preview: imgPreview } = carouselImages[i]
    const carouselFileNodeID = await createFileNode({
      id: imgId,
      preview: imgPreview,
      cache,
      createNode,
      createNodeId,
      touchNode,
    })

    /** eslint-disable-next-line require-atomic-updates */
    if (carouselFileNodeID) {
      datum.carouselImages[i].localFile___NODE = carouselFileNodeID
    }
  }

  return datum
}
