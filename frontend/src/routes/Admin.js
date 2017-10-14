import React, { Component } from 'react'
import NavBar from '../components/NavBar'
import NavBarLink from '../components/NavBarLink'

class Admin extends Component {
  render = () => {
    return (
      <NavBar>
        <NavBarLink show hardReload href="/metacode_sets" text="Metacode Sets" />
        <NavBarLink show hardReload href="/metacode_sets/new" text="New Set" />
        <NavBarLink show hardReload href="/metacodes" text="Metacodes" />
        <NavBarLink show hardReload href="/metacodes/new" text="New Metacode" />
      </NavBar>
    )
  }
}

export default Admin
