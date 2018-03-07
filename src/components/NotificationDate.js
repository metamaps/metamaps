import React, { Component } from 'react'

class NotificationDate extends Component {
  render = () => {
    const { date } = this.props
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const created = new Date(date)
    return <span>{months[created.getMonth()]} {created.getDate()}</span>
  } 
}

export default NotificationDate