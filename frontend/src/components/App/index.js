import React, { Component, PropTypes } from 'react'

import MobileHeader from './MobileHeader'
import UpperLeftUI from './UpperLeftUI'
import UpperRightUI from './UpperRightUI'
import Toast from './Toast'

class App extends Component {
  static propTypes = {
    children: PropTypes.object,
    toast: PropTypes.string,
    unreadNotificationsCount: PropTypes.number,
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
            onRequestAccess } = this.props
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
                                openInviteLightbox={openInviteLightbox}
                                signInPage={pathname === '/login'} />}
      <Toast message={toast} />
      {!mobile && currentUser && <a className='feedback-icon' target='_blank' href='https://hylo.com/c/metamaps/tag/feedback'></a>}
      {children}
    </div>
  }
}

export default App
