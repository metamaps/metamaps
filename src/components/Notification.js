import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import NotificationDate from './NotificationDate'
import NotificationBody from './NotificationBody'

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
    const onClick = this.props.onClick || function() {}

    if (!notification.data.object) {
      return null
    }

    return <li className={classes}>
      <Link to={`/notifications/${notification.id}`} onClick={onClick}>
        <div className='notification-actor'>
          <img src={notification.actor.image} />
        </div>
        <NotificationBody notification={notification} />
      </Link>
      <div className='notification-read-unread'>
        {!notification.is_read && <div onClick={this.markAsRead}>
          mark read
        </div>}
        {notification.is_read && <div onClick={this.markAsUnread}>
          mark unread
        </div>}
      </div>
      <div className='notification-date'>
        <NotificationDate date={notification.created_at} />
      </div>
      <div className='clearfloat'></div>
    </li>
  }
}

export default Notification
