import React, { Component } from 'react'

import NavBar from '../../components/NavBar'
import NavBarLink from '../../components/NavBarLink'

class NotificationsHeader extends Component {
  render = () => {
    return (
      <NavBar>
        <NavBarLink show matchChildRoutes href="/notifications"
          linkClass="notificationsLink" text="Notifications" />
        <NavBarLink show href="/" linkClass="myMaps" text="Maps" />
      </NavBar>
    )
  }
}

export default NotificationsHeader