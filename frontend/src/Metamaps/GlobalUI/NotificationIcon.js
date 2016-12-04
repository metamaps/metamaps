/* global $ */

import React from 'react'
import ReactDOM from 'react-dom'

import Active from '../Active'
import NotificationIconComponent from '../../components/NotificationIcon'

const NotificationIcon = {
  unreadNotificationsCount: null,
  
  init: function(serverData) {
    const self = NotificationIcon
    self.unreadNotificationsCount = serverData.unreadNotificationsCount
    self.render()
  },
  render: function(newUnreadCount = null) {
    if (newUnreadCount !== null) {
      NotificationIcon.unreadNotificationsCount = newUnreadCount
    }
    
    if (Active.Mapper !== null) {
      ReactDOM.render(React.createElement(NotificationIconComponent, {
        unreadNotificationsCount: NotificationIcon.unreadNotificationsCount
      }), $('#notification_icon').get(0))
    }
  }
}

export default NotificationIcon