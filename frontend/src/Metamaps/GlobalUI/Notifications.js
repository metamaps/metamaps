const Notifications = {
  notifications: null,
  fetch: render => {
    $.ajax({
      url: '/notifications.json',
      success: function(data) {
        Notifications.notifications = data
        render()
      }
    })
  }
}

export default Notifications
