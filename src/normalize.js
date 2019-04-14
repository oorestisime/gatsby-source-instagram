const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.downloadMediaFile = async ({
  datum,
  store,
  cache,
  createNode,
  createNodeId,
  touchNode,
}) => {
  let fileNodeID
  if (datum.internal.type === `InstaNode`) {
    const mediaDataCacheKey = `instagram-media-${datum.id}`
    const cacheMediaData = await cache.get(mediaDataCacheKey)

    // If we have cached media data reuse
    // previously created file node to not try to redownload
    if (cacheMediaData) {
      fileNodeID = cacheMediaData.fileNodeID
      touchNode({
        nodeId: cacheMediaData.fileNodeID,
      })
    }

    // If we don't have cached data, download the file
    if (!fileNodeID) {
      try {
        const fileNode = await createRemoteFileNode({
          url: datum.preview,
          store,
          cache,
          createNode,
          createNodeId,
        })

        if (fileNode) {
          fileNodeID = fileNode.id

          await cache.set(mediaDataCacheKey, {
            fileNodeID,
          })
        }
      } catch (e) {
        console.log(`Could not download file, error is`, e)
      }
    }
  }

  if (fileNodeID) {
    datum.localFile___NODE = fileNodeID
  }
  return datum
}
