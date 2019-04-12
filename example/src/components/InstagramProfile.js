import React, { useContext } from "react"
import { Box, Heading, Grid, Text, ResponsiveContext, Image } from "grommet"

export const InstagramProfile = ({ profile }) => {
  const size = useContext(ResponsiveContext)
  const extraProps =
    size !== `small` ? { style: { gridColumnStart: 2 } } : undefined
  return (
    <Box {...extraProps}>
      <Grid
        areas={[
          { name: "nav", start: [0, 0], end: [0, 0] },
          { name: "main", start: [1, 0], end: [2, 0] },
          { name: "foot", start: [0, 1], end: [2, 1] },
        ]}
        columns={["small", "flex", "medium"]}
        rows={["small", "small"]}
        gap="small"
      >
        <Box gridArea="nav" width="small" height="small">
          <Image fit="cover" src={profile.profile_pic_url_hd} />
        </Box>
        <Box gridArea="main" height="small" style={{ padding: "1rem" }}>
          <Text>
            <b>@{profile.username}</b>
          </Text>
          <Text>{profile.edge_followed_by.count} followers</Text>
          <Text>{profile.edge_follow.count} following</Text>
          <Text>{profile.full_name}</Text>
        </Box>
        <Box gridArea="foot" style={{ padding: "1rem" }}>
          <Text>{profile.biography}</Text>
        </Box>
      </Grid>
    </Box>
  )
}
