/* eslint-disable camelcase */
const axios = require(`axios`)

export async function scrapingInstagramPosts({ username }) {
  return axios
    .get(
      `https://instagram.com/graphql/query/?query_id=17888483320059182&variables={"id":"${username}","first":100,"after":null}`
    )
    .then((response) => {
      if(response.data.includes("Login • Instagram")){
        console.error(`gatsby-source-instagram: Instagram API returned login page due to rate limiting. If you wish to avoid this error please use Graph API. Read docs for more info:\nhttps://github.com/oorestisime/gatsby-source-instagram#common-build-errors`);
        return null;
      } else {
        const photos = []
        response.data.data.user.edge_owner_to_timeline_media.edges.forEach(edge => {
          if (edge.node) {
            photos.push(edge.node)
          }
        });
        return photos
      }
    })
    .catch((err) => {
      console.warn(`\nCould not fetch instagram posts. Error status ${err}`)
      return null
    })
}

export async function scrapingInstagramHashtags({ hashtag }) {
  return axios
    .get(`https://www.instagram.com/explore/tags/${hashtag}/?__a=1`)
    .then((response) => {
      const photos = []
      response.data.graphql.hashtag.edge_hashtag_to_media.edges.forEach(
        (edge) => {
          if (edge.node) {
            photos.push(edge.node)
          }
        }
      )
      return photos
    })
    .catch((err) => {
      console.warn(
        `\nCould not fetch instagram posts from hashtag. Error status ${err}`
      )
      return null
    })
}

export async function scrapingInstagramUser({ username }) {
  return axios
    .get(`https://www.instagram.com/${username}/?__a=1`)
    .then((response) => {
      const { user } = response.data.graphql
      const infos = {
        id: user.id,
        full_name: user.full_name,
        biography: user.biography,
        edge_followed_by: user.edge_followed_by,
        edge_follow: user.edge_follow,
        profile_pic_url: user.profile_pic_url,
        profile_pic_url_hd: user.profile_pic_url_hd,
        username: user.username,
      }
      return infos
    })
    .catch((err) => {
      console.warn(`\nCould not fetch instagram user. Error status ${err}`)
      return null
    })
}

function getHashtags(data) {
  return data.map((datum) => {
    // matches non url hashtags
    const hashtagMatch = /(^|\s)(#[a-z\d-_]+)/gi
    const caption = datum?.caption ?? ``

    // combine all comments into one string
    const comments =
      datum.comments?.data?.length > 0 ?? false
        ? datum.comments.data
            .map((comment) => (comment && comment.text ? comment.text : ``))
            .filter((comment) => comment && comment.length > 0)
            .join(` `)
        : ``

    // combine caption and comment strings, then run match
    const captionHashtags = (caption + ` ` + comments).match(hashtagMatch)

    const hashtags =
      captionHashtags?.length > 0 ?? false
        ? // remove whitespace from beginning of each hashtag
          captionHashtags.map((item) => item.trim())
        : []

    return {
      ...datum,
      // remove duplicate hashtags
      hashtags: [...new Set(hashtags)],
    }
  })
}

export async function apiInstagramPosts({
  access_token,
  instagram_id,
  username,
  paginate = `100`,
  maxPosts,
  hashtags = null,
}) {
  const hashtagsEnabled = hashtags === true || hashtags?.enabled
  const hashtagsCommentDepth = hashtags?.commentDepth ?? 3
  const commentsParam = hashtagsEnabled
    ? `,comments.limit(${hashtagsCommentDepth}){text}`
    : ``

  return axios
    .get(
      `https://graph.facebook.com/v7.0/${instagram_id}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count,username,children{media_url},permalink${commentsParam}&limit=${paginate}&access_token=${access_token}`
    )
    .then(async (response) => {
      const results = []
      results.push(...response.data.data)
      
      /**
       * If maxPosts option specified, then check if there is a next field in the response data and the results' length <= maxPosts
       * otherwise, fetch as more as it can.
       */
      while (
        maxPosts
          ? response.data.paging.next && results.length <= maxPosts
          : response.data.paging.next
      ) {
        response = await axios(response.data.paging.next)
        results.push(...response.data.data)
      }

      // if hashtags are true extract hashtags from captions and comments
      const posts = hashtagsEnabled && results ? getHashtags(results) : results

      return maxPosts ? posts.slice(0, maxPosts) : posts
    })
    .catch(async (err) => {
      console.warn(
        `\nCould not get instagram posts using the Graph API. Error status ${err}`
      )
      console.warn(`Falling back to public scraping... with ${username}`)

      if (username) {
        const photos = await scrapingInstagramPosts({
          username,
        })
        return photos
      }

      return null
    })
}
