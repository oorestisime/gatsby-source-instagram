/* eslint-disable camelcase */
import axios from "axios"
import type { Options, RawInstagramNode } from "./types/options"

export async function scrapingInstagramPosts(username: Options["username"]) {
  return axios
    .get(
      `https://instagram.com/graphql/query/?query_id=17888483320059182&variables={"id":"${username}","first":100,"after":null}`
    )
    .then((response) => {
      const photos: RawInstagramNode[] = response.data.data.user.edge_owner_to_timeline_media.edges.map(
        (edge: { node: RawInstagramNode }) => {
          if (edge.node) {
            return edge.node
          }
        }
      )
      return photos
    })
    .catch((err) => {
      console.warn(`\nCould not fetch instagram posts. Error status ${err}`)
      return null
    })
}

function getHashtags(data: RawInstagramNode[]) {
  return data.map((datum) => {
    // matches non url hashtags
    const hashtagMatch = /(^|\s)(#[a-z\d-_]+)/gi
    const caption = datum?.caption ?? ``

    // combine all comments into one string
    const comments =
      datum.comments?.data?.length > 0 ?? false
        ? datum.comments?.data
            .map((comment) => (comment && comment.text ? comment.text : ``))
            .filter((comment) => comment && comment.length > 0)
            .join(` `)
        : ``

    // combine caption and comment strings, then run match
    const captionHashtags = (caption + ` ` + comments).match(hashtagMatch) || []

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
  hashtags,
}: Options) {
  const hashtagsEnabled = hashtags || hashtags?.enabled

  const hashtagsCommentDepth = hashtags?.commentDepth ?? 3
  const commentsParam = hashtagsEnabled
    ? `,comments.limit(${hashtagsCommentDepth}){text}`
    : ``

  return axios
    .get(
      `https://graph.facebook.com/v7.0/${instagram_id}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count,username,children{media_url},permalink${commentsParam}&limit=${paginate}&access_token=${access_token}`
    )
    .then(async (response) => {
      const results: RawInstagramNode[] = []
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

      const posts = hashtagsEnabled && results ? getHashtags(results) : results

      return maxPosts ? posts.slice(0, maxPosts) : posts
    })
    .catch(async (err) => {
      console.warn(
        `\nCould not get instagram posts using the Graph API. Error status ${err}`
      )
      console.warn(`Falling back to public scraping... with ${username}`)

      if (username) {
        const photos = await scrapingInstagramPosts(username)
        return photos
      }

      return null
    })
}
