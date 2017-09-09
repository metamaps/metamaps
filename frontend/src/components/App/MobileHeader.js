import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import Sprite from '../common/Sprite'

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
    const { unreadNotificationsCount, currentUser, mobileTitle,
            mobileTitleWidth, onTitleClick, serverData } = this.props
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
            <li>
              <a href="/maps/new">
                <Sprite src={serverData['map_control_sprite.png']}
                      width={32} height={32} xIndex={4} yIndex={0} />
                New Map
              </a>
            </li>
            <li>
              <Link to="/explore/mine">
                <Sprite src={serverData['exploremaps_sprite.png']}
                      width={32} height={32} xIndex={1} yIndex={0} />
                My Maps
              </Link>
            </li>
            <li>
              <Link to="/explore/shared">
                <Sprite src={serverData['exploremaps_sprite.png']}
                        width={32} height={32} xIndex={4} yIndex={0} />
                Shared With Me
              </Link>
            </li>
            <li>
              <Link to="/explore/starred">
                <Sprite src={serverData['exploremaps_sprite.png']}
                        width={32} height={32} xIndex={3} yIndex={0} />
                Starred By Me
              </Link>
            </li>
            <li>
              <Link to="/explore/active">
                <Sprite src={serverData['exploremaps_sprite.png']}
                        width={32} height={32} xIndex={0} yIndex={0} />
                All Maps
              </Link>
            </li>
            <li>
              <a href={`/users/${currentUser.id}/edit`}>
                <Sprite src={serverData['user_sprite.png']}
                        width={32} height={32} xIndex={0} yIndex={0} />
                Account
              </a>
            </li>
            <li className="notifications">
              <a href="/notifications">
                <Sprite src={serverData['map_control_sprite.png']}
                        width={32} height={32} xIndex={0} yIndex={0} />
                Notifications
              </a>
              {unreadNotificationsCount > 0 && <div className="unread-notifications-dot"></div>}
            </li>
            <li>
              <a id="Logout" href="/logout">
                <Sprite src={serverData['user_sprite.png']}
                        width={32} height={32} xIndex={0} yIndex={3} />
                Sign Out
              </a>
            </li>
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
