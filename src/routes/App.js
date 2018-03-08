import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MobileHeader from '../components/MobileHeader'
import UpperLeftUI from '../components/UpperLeftUI'
import UpperRightUI from '../components/UpperRightUI'
import Toast from '../components/Toast'
import LightBoxes from '../components/LightBoxes'

class App extends Component {
  static propTypes = {
    children: PropTypes.object,
    toast: PropTypes.string,
    unreadNotificationsCount: PropTypes.number,
    notifications: PropTypes.array,
    fetchNotifications: PropTypes.func,
    markAsRead: PropTypes.func,
    markAsUnread: PropTypes.func,
    location: PropTypes.object,
    mobile: PropTypes.bool,
    mobileTitle: PropTypes.string,
    mobileTitleWidth: PropTypes.number,
    mobileTitleClick: PropTypes.func,
    openInviteLightbox: PropTypes.func,
    map: PropTypes.object,
    userRequested: PropTypes.bool,
    requestAnswered: PropTypes.bool,
    requestApproved: PropTypes.bool,
    onRequestAccess: PropTypes.func,
    serverData: PropTypes.object
  }

  static childContextTypes = {
    location: PropTypes.object
  }

  getChildContext () {
    const { location } = this.props
    return {location}
  }

  render () {
    const { children, toast, unreadNotificationsCount, openInviteLightbox,
            mobile, mobileTitle, mobileTitleWidth, mobileTitleClick, location,
            map, userRequested, requestAnswered, requestApproved, serverData,
            onRequestAccess, notifications, fetchNotifications,
            markAsRead, markAsUnread, notificationsLoading,
            importHandleFile, downloadScreenshot, onExport } = this.props
    const { pathname } = location || {}
    // this fixes a bug that happens otherwise when you logout
    const currentUser = this.props.currentUser && this.props.currentUser.id ? this.props.currentUser : null
    const unauthedHome = pathname === '/' && !currentUser
    return <div className="wrapper" id="wrapper">
      {mobile && <MobileHeader currentUser={currentUser}
                               unreadNotificationsCount={unreadNotificationsCount}
                               mobileTitle={mobileTitle}
                               mobileTitleWidth={mobileTitleWidth}
                               onTitleClick={mobileTitleClick}
                               serverData={serverData} />}
      {!unauthedHome && <UpperLeftUI currentUser={currentUser}
                                     map={map}
                                     userRequested={userRequested}
                                     requestAnswered={requestAnswered}
                                     requestApproved={requestApproved}
                                     onRequestClick={onRequestAccess} />}
      {!mobile && <UpperRightUI currentUser={currentUser}
                                unreadNotificationsCount={unreadNotificationsCount}
                                notifications={notifications}
                                notificationsLoading={notificationsLoading}
                                fetchNotifications={fetchNotifications}
                                markAsRead={markAsRead}
                                markAsUnread={markAsUnread}
                                openInviteLightbox={openInviteLightbox}
                                signInPage={pathname === '/login'} />}
      <Toast message={toast} />
      {children}
      <LightBoxes inviteCode={currentUser && currentUser.get('invite_code')}
                  importHandleFile={importHandleFile}
                  downloadScreenshot={downloadScreenshot}
                  onExport={onExport} />
    </div>
  }
}

export default App
