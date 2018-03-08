/* global $ */
import { findIndex } from 'lodash'
import GlobalUI from './index'

const Notifications = {
  notifications: [],
  notificationsLoading: false,
  unreadNotificationsCount: 0,
  init: serverData => {
    if (serverData.ActiveMapper) {
      Notifications.unreadNotificationsCount = serverData.ActiveMapper.unread_notifications_count
    }
  },
  fetchNotifications: render => {
    Notifications.notificationsLoading = true
    render()
    $.ajax({
      url: '/notifications.json',
      success: function(data) {
        Notifications.notifications = data
        Notifications.notificationsLoading = false
        render()
      },
      error: function() {
        GlobalUI.notifyUser('There was an error fetching notifications')
      }
    })
  },
  fetchNotification: (render, id) => {
    $.ajax({
      url: `/notifications/${id}.json`,
      success: function(data) {
        const index = findIndex(Notifications.notifications, n => n.id === data.id)
        if (index === -1) {
          // notification not loaded yet, insert it at the start
          Notifications.notifications.unshift(data)
        } else {
          // notification there, replace it
          Notifications.notifications[index] = data
        }
        render()
      },
      error: function() {
        GlobalUI.notifyUser('There was an error fetching that notification')
      }
    })
  },
  incrementUnread: (render) => {
    Notifications.unreadNotificationsCount++
    render()
  },
  decrementUnread: (render) => {
    Notifications.unreadNotificationsCount--
    render()
  },
  markAsRead: (render, id) => {
    const n = Notifications.notifications.find(n => n.id === id)
    $.ajax({
      url: `/notifications/${id}/mark_read.json`,
      method: 'PUT',
      success: function(r) {
        if (n) {
          Notifications.unreadNotificationsCount--
          n.is_read = true
          render()
        }
      },
      error: function() {
        GlobalUI.notifyUser('There was an error marking that notification as read')
      }
    })
  },
  markAsUnread: (render, id) => {
    const n = Notifications.notifications.find(n => n.id === id)
    $.ajax({
      url: `/notifications/${id}/mark_unread.json`,
      method: 'PUT',
      success: function() {
        if (n) {
          Notifications.unreadNotificationsCount++
          n.is_read = false
          render()
        }
      },
      error: function() {
        GlobalUI.notifyUser('There was an error marking that notification as unread')
      }
    })
  }
}

export default Notifications
