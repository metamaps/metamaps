import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import onClickOutsideAddon from 'react-onclickoutside'

class AccountMenu extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    onInviteClick: PropTypes.func,
    closeBox: PropTypes.func
  }

  handleClickOutside = () => {
    this.props.closeBox()
  }

  render () {
    const { currentUser, onInviteClick } = this.props
    return <div>
      <img className="sidebarAccountImage" src={currentUser.get('image')} width="48" height="48" />
      <h3 className="accountHeader">{currentUser.get('name')}</h3>
      <ul>
        <li className="accountListItem accountSettings">
          <div className="accountIcon"></div>
          <Link to={`/users/${currentUser.id}/edit`}>Settings</Link>
        </li>
        <li className="accountListItem accountAdmin">
          <div className="accountIcon"></div>
          <Link to="/metacodes">Admin</Link>
        </li>
        <li className="accountListItem accountApps">
          <div className="accountIcon"></div>
          <Link to="/oauth/authorized_applications">Apps</Link>
        </li>
        <li className="accountListItem accountInvite" onClick={onInviteClick}>
          <div className="accountIcon"></div>
          <span>Share Invite</span>
        </li>
        <li className="accountListItem accountLogout">
          <div className="accountIcon"></div>
          <a id="Logout" href="/logout">Sign Out</a>
        </li>
      </ul>
    </div>
  }
}

export default onClickOutsideAddon(AccountMenu)
