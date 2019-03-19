import React, { useContext } from "react"
import { Box, Heading, Text, ResponsiveContext } from "grommet"
import { Instagram } from "."

export const Container = ({ title, text, nodes }) => {
  const size = useContext(ResponsiveContext)
  const extraProps =
    size !== `small` ? { style: { gridColumnStart: 2 } } : undefined
  return (
    <Box {...extraProps}>
      <Box background="white">
        <Heading alignSelf="center" level="4">
          {title}
        </Heading>
        <Box pad="small" width="large" alignSelf="center">
          <Text margin={{ bottom: `medium` }}>{text}</Text>
        </Box>
      </Box>

      <Instagram nodes={nodes} />
    </Box>
  )
}
