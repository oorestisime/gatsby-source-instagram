const axios = require(`axios`)
const cheerio = require(`cheerio`)
const crypto = require(`crypto`)

function getInstagramPosts(username) {
  return new Promise((resolve) => {
    axios.get(`https://www.instagram.com/${username}/`)
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
        resolve(photos)
      })
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
  }

  // Get content digest of node. (Required field)
  const contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(node))
    .digest(`hex`)

  node.internal.contentDigest = contentDigest
  return node
}

exports.sourceNodes = async ({ actions }, { username }) => {
  const { createNode } = actions

  const data = await getInstagramPosts(username)
  // Process data into nodes.
  data.forEach(datum => createNode(processDatum(datum)))
}
