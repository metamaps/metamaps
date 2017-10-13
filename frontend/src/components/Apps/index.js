import React, { Component } from 'react'
import NavBar from '../App/Navbar'
import NavBarLink from '../App/NavBarLink'

class Apps extends Component {
  render = () => {
    const { currentUser } = this.props

    return (
      <NavBar>
        {currentUser.get('admin') && <NavBarLink show href="/oauth/applications"
          className="activeMaps" text="Registered Apps" />}
        <NavBarLink show href="/oauth/authorized_applications"
          linkClass="authedApps" text="Authorized Apps" />
        <NavBarLink show href="/" linkClass="myMaps exploreMapsButton" text="Maps" />
      </NavBar>
    )
  }
}

export default Apps
