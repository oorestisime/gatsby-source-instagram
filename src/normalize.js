"use strict";

const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

/**
 * Create file nodes to be used by gatsby image.
 * @param {object} agrugments - The good stuff.
 * @returns {number} fileNodeID - Unique identifier.
 */
const createFileNode = async ({
    id,
    preview,
    store,
    cache,
    createNode,
    createNodeId,
    touchNode
}) => {
    const mediaDataCacheKey = `instagram-media-${id}`;
    const cacheMediaData = await cache.get(mediaDataCacheKey);
    let fileNodeID;

    if (cacheMediaData) {
        fileNodeID = cacheMediaData.fileNodeID
        touchNode({ nodeId: fileNodeID });
        return fileNodeID;
    }

    try {
        const fileNode = await createRemoteFileNode({
            url: preview,
            store,
            cache,
            createNode,
            createNodeId
        });
        fileNodeID = fileNode.id;

        await cache.set(mediaDataCacheKey, { fileNodeID });
    }
    catch (error) {
        console.error('Could not dowcreate remote file noden, error is: ', error);
    }

    return fileNodeID;
}

/**
 * Download media files.
 * @param {object} agrugments - The good stuff.
 * @returns {object} datum - Media data.
 */
exports.downloadMediaFile = async ({
  datum,
  store,
  cache,
  createNode,
  createNodeId,
  touchNode
}) => {
    const { carouselImages, id, preview } = datum;

    /** Create a file node for base image */
    const fileNodeID = await createFileNode({
        id,
        preview,
        store,
        cache,
        createNode,
        createNodeId,
        touchNode
    });

    /** eslint-disable-next-line require-atomic-updates */
    if (fileNodeID) datum.localFile___NODE = fileNodeID;

    /** If all we have is a single image stop here */
    if (!carouselImages.length) return datum;

    /** Loop over all carousel images and create a local file node for each */
    for (let i = 0; i < carouselImages.length; i++) {
        const { id: imgId, preview: imgPreview} = carouselImages[i];
        const carouselFileNodeID = await createFileNode({
            id: imgId,
            preview: imgPreview,
            store,
            cache,
            createNode,
            createNodeId,
            touchNode
        });

        /** eslint-disable-next-line require-atomic-updates */
        if (carouselFileNodeID) datum.carouselImages[i].localFile___NODE = carouselFileNodeID;
    }

    return datum;
};
