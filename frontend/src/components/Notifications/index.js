import React, { Component } from 'react'
import NavBar from '../App/Navbar'
import NavBarLink from '../App/NavBarLink'

class Notifications extends Component {
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

export default Notifications
