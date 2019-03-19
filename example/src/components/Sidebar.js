import React, { useContext, useState } from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { Box, ResponsiveContext, Heading, Button, Layer } from "grommet"
import { FormClose, Menu, Github } from "grommet-icons"

const InternalLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  :visited {
    color: inherit;
  }
`

const SidebarContent = () => (
  <Box pad={{ top: `large` }} alignSelf="center" gap="medium">
    <InternalLink to="/">
      <Button hoverIndicator>Graph API</Button>
    </InternalLink>
    <InternalLink to="/scraping">
      <Button hoverIndicator>Public Scraping</Button>
    </InternalLink>
    <InternalLink to="/hashtag">
      <Button hoverIndicator>Hashtag</Button>
    </InternalLink>
    <Box direction="row">
      <Button
        as="a"
        icon={<Github size="large" />}
        href="https://github.com/oorestisime/gatsby-source-instagram"
        rel="noopener noreferrer"
      />
    </Box>
  </Box>
)

export const Sidebar = () => {
  const size = useContext(ResponsiveContext)
  const [showSidebar, toggleSidebar] = useState(false)

  if (showSidebar) {
    const sidebarProps = {
      full: `vertical`,
      background: `light-3`,
      position: `left`,
      modal: true,
      onClickOutside: () => toggleSidebar(false),
      onEsc: () => toggleSidebar(false),
    }
    return (
      <Layer {...sidebarProps}>
        <Button
          alignSelf="center"
          hoverIndicator
          onClick={() => toggleSidebar(false)}
        >
          <FormClose />
        </Button>
        <SidebarContent />
      </Layer>
    )
  }
  const extraProps =
    size === `small`
      ? undefined
      : {
          height: `100vh`,
          width: `300px`,
          style: { position: `absolute` },
        }
  return (
    <Box pad={{ bottom: size }} {...extraProps} background="light-1">
      <Box alignSelf="center" direction="row">
        {size === `small` && (
          <Button
            icon={<Menu />}
            plain
            color="black"
            onClick={() => toggleSidebar(!showSidebar)}
          />
        )}
        <Heading level="4">Gatsby-source-instagram</Heading>
      </Box>
      {size !== `small` && <SidebarContent />}
    </Box>
  )
}
