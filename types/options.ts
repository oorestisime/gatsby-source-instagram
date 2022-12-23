type HashtagsOptions = {
  enabled: boolean
  commentDepth: number
}

type Hashtags = boolean & HashtagsOptions

export interface Options {
  type: string
  paginate?: string
  access_token?: string
  instagram_id?: string
  username?: string
  maxPosts?: number
  hashtags?: Hashtags
}

type Thumbnail = {
  src: string
  config_width: string
  config_height: string
}

type Caption = {
  node: {
    text: string
  }
}

type Comment = {
  text: string
}

type Children = {
  data: RawInstagramNode[]
}

export interface RawInstagramNode {
  __typename?: string
  id: string
  username?: string
  owner: {
    username?: string
    id: string
  }
  shortcode: string
  like_count: string
  caption: string
  thumbnail_resources: Thumbnail[]
  media_type: string
  display_url?: string
  thumbnail_url?: string
  media_url: string
  taken_at_timestamp?: string
  timestamp: string
  dimensions: string
  comments_count: string
  edge_liked_by: {
    count: string
  }
  edge_media_preview_like: {
    count: string
  }
  edge_media_to_caption: Caption[]
  comments: {
    data: Comment[]
  }
  hashtags: string[]
  permalink: string
  children: Children
  preview: string
}

export interface GatsbyInstagramNode {
  username: string
  id: string
  parent: string
  internal: {
    type: string
    contentDigest: string
  }
  children: []
  likes: string
  caption: string
  thumbnails: Thumbnail[]
  mediaType: string
  preview: string
  original: string
  timestamp: number | string
  dimensions: string
  comments: string
  hashtags: string[]
  permalink: string
  carouselImages: GatsbyInstagramNode[]
  localFile___NODE?: string
}
