import React, { useContext } from "react"
import { Box, Text, ResponsiveContext, Image } from "grommet"

export const InstagramProfile = ({ profile }) => {
  const size = useContext(ResponsiveContext)
  const extraProps =
    size !== `small` ? { style: { gridColumnStart: 2 } } : undefined
  return (
    <Box pad="large" {...extraProps}>
      <Box alignSelf="center" width="small" height="small">
        <Image fit="cover" src={profile.profile_pic_url_hd} />
      </Box>
      <Box alignSelf="center" height="small" pad="small">
        <Text>
          <b>@{profile.username}</b>
        </Text>
        <Text>{profile.edge_followed_by.count} followers</Text>
        <Text>{profile.edge_follow.count} following</Text>
        <Text>{profile.full_name}</Text>
      </Box>
      <Box alignSelf="center" width="medium" wrap>
        <Text>{profile.biography}</Text>
      </Box>
    </Box>
  )
}
