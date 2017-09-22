import GlobalUI from './index'

const Notifications = {
  notifications: null,
  unreadNotificationsCount: 0,
  init: serverData => {
    Notifications.unreadNotificationsCount = serverData.unreadNotificationsCount
  },
  fetch: render => {
    $.ajax({
      url: '/notifications.json',
      success: function(data) {
        Notifications.notifications = data
        render()
      }
    })
  },
  markAsRead: (render, id) => {
    const n = Notifications.notifications.find(n => n.id === id)
    $.ajax({
      url: `/notifications/${id}/mark_read`,
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
      url: `/notifications/${id}/mark_unread`,
      method: 'PUT',
      success: function() {
        if (n) {
          Notifications.unreadNotificationsCount++
          n.is_read = false
          render()
        }
      },
      error: function() {
        GlobalUI.notifyUser('There was an error marking that notification as read')
      }
    })
  }
}

export default Notifications
