import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AccountMenu from './AccountMenu'
import LoginForm from './LoginForm'
import NotificationIcon from './NotificationIcon'
import NotificationBox from './NotificationBox'

class UpperRightUI extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    signInPage: PropTypes.bool,
    unreadNotificationsCount: PropTypes.number,
    fetchNotifications: PropTypes.func,
    notifications: PropTypes.array,
    markAsRead: PropTypes.func.isRequired,
    markAsUnread: PropTypes.func.isRequired,
    openInviteLightbox: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      accountBoxOpen: false,
      notificationsBoxOpen: false
    }
  }

  reset = () => {
    this.setState({
      accountBoxOpen: false,
      notificationsBoxOpen: false
    })
  }

  toggleAccountBox = () => {
    this.setState({
      accountBoxOpen: !this.state.accountBoxOpen,
      notificationsBoxOpen: false
    })
  }

  toggleNotificationsBox = () => {
    this.setState({
      notificationsBoxOpen: !this.state.notificationsBoxOpen,
      accountBoxOpen: false
    })
  }

  render () {
    const { currentUser, signInPage, unreadNotificationsCount,
            notifications, fetchNotifications, openInviteLightbox,
            markAsRead, markAsUnread, notificationsLoading } = this.props
    const { accountBoxOpen, notificationsBoxOpen } = this.state
    return <div className="upperRightUI">
      {currentUser && <a href="/maps/new" target="_blank" className="addMap upperRightEl upperRightIcon">
        <div className="tooltipsUnder">
          Create New Map
        </div>
      </a>}
      {currentUser && <span id="notification_icon">
        <NotificationIcon
          unreadNotificationsCount={unreadNotificationsCount}
          toggleNotificationsBox={this.toggleNotificationsBox}/>
        {notificationsBoxOpen && <NotificationBox
          loading={notificationsLoading}
          notifications={notifications}
          fetchNotifications={fetchNotifications}
          markAsRead={markAsRead}
          markAsUnread={markAsUnread}
          toggleNotificationsBox={this.toggleNotificationsBox}/>}
      </span>}
      {!signInPage && <div className="sidebarAccount upperRightEl">
        <div className="sidebarAccountIcon ignore-react-onclickoutside" onClick={this.toggleAccountBox}>
          <div className="tooltipsUnder">Account</div>
          {currentUser && <img src={currentUser.get('image')} />}
          {!currentUser && 'SIGN IN'}
          {!currentUser && <div className="accountInnerArrow"></div>}
        </div>
        {accountBoxOpen && <div className="sidebarAccountBox upperRightBox">
          {currentUser
            ? <AccountMenu onInviteClick={openInviteLightbox} currentUser={currentUser} closeBox={this.reset} />
            : <LoginForm closeBox={this.reset} />}
        </div>}
      </div>}
      <div className="clearfloat"></div>
    </div>
  }
}

export default UpperRightUI
