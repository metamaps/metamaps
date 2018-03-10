import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NavBar from '../../components/NavBar'
import NavBarLink from '../../components/NavBarLink'

class AppsHeader extends Component {
  render = () => {
    const { currentUser } = this.props

    return (
      <NavBar>
        {currentUser && currentUser.get('admin') && <NavBarLink show
          matchChildRoutes href="/oauth/applications" linkClass="activeMaps"
          text="Registered Apps" />}
        <NavBarLink show matchChildRoutes
          href="/oauth/authorized_applications"
          linkClass="authedApps" text="Authorized Apps" />
        <NavBarLink show href="/" linkClass="myMaps" text="Maps" />
      </NavBar>
    )
  }
}

export default AppsHeader
