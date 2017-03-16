import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class MobileHeader extends Component {
  static propTypes = {
    unreadNotificationsCount: PropTypes.number,
    currentUser: PropTypes.object,
    mobileTitle: PropTypes.string,
    mobileTitleWidth: PropTypes.number,
    onTitleClick: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {open: false}
  }

  toggle = () => {
    this.setState({open: !this.state.open})
  }

  render() {
    const { unreadNotificationsCount, currentUser, mobileTitle, mobileTitleWidth, onTitleClick } = this.props
    const { open } = this.state
    return <div>
      <div id="mobile_header">
        <div id="header_content" style={{width: `${mobileTitleWidth}px`}} onClick={onTitleClick}>
          {mobileTitle}
        </div>
        <div id="menu_icon" onClick={this.toggle}>
          {unreadNotificationsCount > 0 && <div className="unread-notifications-dot"></div>}
        </div>
      </div>
      {open && <div id="mobile_menu">
        {currentUser && <ul onClick={this.toggle}>
            <li className="mobileMenuUser">
              <Link to={`/explore/mapper/${currentUser.id}`}>
                <img src={currentUser.get('image')} width="32" height="32" />
                <span>{currentUser.get('name')}</span>
              </Link>
            </li>
            <li><a href="/maps/new">New Map</a></li>
            <li><Link to="/explore/mine">My Maps</Link></li>
            <li><Link to="/explore/shared">Shared With Me</Link></li>
            <li><Link to="/explore/starred">Starred By Me</Link></li>
            <li><Link to="/explore/active">All Maps</Link></li>
            <li><a href={`/users/${currentUser.id}/edit`}>Account</a></li>
            <li className="notifications">
              <a href="/notifications">Notifications</a>
              {unreadNotificationsCount > 0 && <div className="unread-notifications-dot"></div>}
            </li>
            <li><a id="Logout" href="/logout">Sign Out</a></li>
        </ul>}
        {!currentUser && <ul onClick={this.toggle}>
          <li><a href="/">Home</a></li>
          <li><Link to="/explore/active">All Maps</Link></li>
          <li><Link to="/explore/featured">Featured Maps</Link></li>
          <li><a href="/request">Request Invite</a></li>
          <li><a href="/login">Login</a></li>
        </ul>}
      </div>}
    </div>
  }
}

export default MobileHeader
