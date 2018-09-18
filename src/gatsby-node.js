const axios = require(`axios`)
const cheerio = require(`cheerio`)
const crypto = require(`crypto`)

async function getInstagramPosts(username) {
  return axios.get(`https://www.instagram.com/${username}/`)
    .then((response) => {
    // handle success
      const $ = cheerio.load(response.data)
      const jsonData = $(`html > body > script`).get(0).children[0].data.replace(`window._sharedData =`, ``).replace(`;`, ``)
      const json = JSON.parse(jsonData).entry_data.ProfilePage[0].graphql
      const photos = []
      json.user.edge_owner_to_timeline_media.edges.forEach((edge) => {
        if (edge.node) {
          photos.push(edge.node)
        }
      })
      return photos
    })
    .catch((err) => {
      console.warn(`\nCould not fetch instagram posts. Error status ${err.response.status}`)
      return null
    })
}

function processDatum(datum) {
  const node = {
    id: datum.shortcode,
    parent: `__SOURCE__`,
    internal: { type: `InstaNode` },
    children: [],
    likes: datum.edge_liked_by,
    thumbnails: datum.thumbnail_resources,
    original: datum.display_url,
    timestamp: datum.taken_at_timestamp,
    dimensions: datum.dimensions
  }

  // Get content digest of node. (Required field)
  const contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(node))
    .digest(`hex`)

  node.internal.contentDigest = contentDigest
  return node
}

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.sourceNodes = async ({ actions }, { username }) => {
  const { createNode } = actions

  const data = await getInstagramPosts(username)

  // Process data into nodes.
  if (data) {
    data.forEach(datum => createNode(processDatum(datum)))
  }
}
