import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Notification extends Component {

  static propTypes = {
    markAsRead: PropTypes.func,
    markAsUnread: PropTypes.func,
    notification: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      is_read: PropTypes.bool.isRequired,
      created_at: PropTypes.string.isRequired,
      actor: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        admin: PropTypes.boolean
      }),
      object: PropTypes.object,
      map: PropTypes.object,
      topic: PropTypes.object,
      topic1: PropTypes.object,
      topic2: PropTypes.object
    })
  }

  getDate = () => {
    const { notification: {created_at} } = this.props
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec']
    const created = new Date(created_at)
    return `${months[created.getMonth()]} ${created.getDate()}`
  }

  markAsRead = () => {
    const { notification, markAsRead } = this.props
    markAsRead(notification.id)
  }

  markAsUnread = () => {
    const { notification, markAsUnread } = this.props
    markAsUnread(notification.id)
  }

  render = () => {
    const { notification } = this.props
    const classes = `notification ${notification.is_read ? 'read' : 'unread'}`
    return <li className={classes}>
      <a href={`/notifications/${notification.id}`}>
        <div className='notification-actor'>
          <img src={notification.actor.image} />
        </div>
        <div className="notification-body">
          <div className="in-bold">{notification.actor.name}</div>
          Other content
        </div>
      </a>
      <div className="notification-read-unread">
        {!notification.is_read && <div onClick={this.markAsRead}>
          mark read
        </div>}
        {notification.is_read && <div onClick={this.markAsUnread}>
          mark unread
        </div>}
      </div>
      <div className="notification-date">
        {this.getDate()}
      </div>
      <div className="clearfloat"></div>
    </li>
  }
}

export default Notification
