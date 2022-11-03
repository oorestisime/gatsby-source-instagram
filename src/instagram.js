/* eslint-disable camelcase */
const axios = require(`axios`)

async function scrapingInstagramPosts({
  username
}) {
  return axios.get(`https://instagram.com/graphql/query/?query_id=17888483320059182&variables={"id":"${username}","first":100,"after":null}`).then(response => {
    const photos = [];
    response.data.data.user.edge_owner_to_timeline_media.edges.forEach(edge => {
      if (edge.node) {
        photos.push(edge.node);
      }
    });
    return photos;
  }).catch(err => {
    console.warn(`\nCould not fetch instagram posts. Error status ${err}`);
    return null;
  });
}

async function apiInstagramPosts({
  access_token,
  instagram_id,
  username,
  paginate = `100`,
  maxPosts,
}) {

  return axios.get(`https://graph.facebook.com/v7.0/${instagram_id}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count,username,children{media_url},permalink&limit=${paginate}&access_token=${access_token}`).then(async response => {
    const results = [];
    results.push(...response.data.data);
    /**
     * If maxPosts option specified, then check if there is a next field in the response data and the results' length <= maxPosts
     * otherwise, fetch as more as it can.
     */

    while (maxPosts ? response.data.paging.next && results.length <= maxPosts : response.data.paging.next) {
      response = await axios(response.data.paging.next);
      results.push(...response.data.data);
    } 

    const posts =  results;
    return maxPosts ? posts.slice(0, maxPosts) : posts;
  }).catch(async err => {
    console.warn(`\nCould not get instagram posts using the Graph API. Error status ${err}`);
    console.warn(`Falling back to public scraping... with ${username}`);

    if (username) {
      const photos = await scrapingInstagramPosts({
        username
      });
      return photos;
    }

    return null;
  });
}