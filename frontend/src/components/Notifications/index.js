import React, { Component } from 'react'
import NavBar from '../App/Navbar'
import NavBarLink from '../App/NavBarLink'

class Notifications extends Component {
  render = () => {
    const { currentUser } = this.props
    return (
      <NavBar>
        <NavBarLink show href="/notifications"
          linkClass="notificationsLink active" text="Notifications" />
        <NavBarLink show href="/" linkClass="myMaps" text="Maps" />
      </NavBar>
    )
  }
}

export default Notifications
