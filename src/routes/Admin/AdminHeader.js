import React, { Component } from 'react'
import NavBar from '../../components/NavBar'
import NavBarLink from '../../components/NavBarLink'

class AdminHeader extends Component {
  render = () => {
    return (
      <NavBar>
        <NavBarLink show href="/metacode_sets" text="Metacode Sets" />
        <NavBarLink show href="/metacode_sets/new" text="New Set" />
        <NavBarLink show href="/metacodes" text="Metacodes" />
        <NavBarLink show href="/metacodes/new" text="New Metacode" />
      </NavBar>
    )
  }
}

export default AdminHeader
