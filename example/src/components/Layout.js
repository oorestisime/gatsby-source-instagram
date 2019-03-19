import React from "react"
import { Grommet, ResponsiveContext, Grid } from "grommet"
import { deepFreeze } from "grommet/utils"
import { Sidebar } from "."

const theme = deepFreeze({
  global: {
    breakpoints: {
      small: {
        value: 400,
      },
      medium: {
        value: 1200,
      },
      large: {},
    },
  },
})

export const Layout = ({ children }) => (
  <Grommet full theme={theme}>
    <ResponsiveContext.Consumer>
      {size => (
        <Grid columns={size === `small` ? [`1fr`] : [`300px`, `1fr`]}>
          <Sidebar />
          {children}
        </Grid>
      )}
    </ResponsiveContext.Consumer>
  </Grommet>
)
