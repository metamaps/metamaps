import React, { Component } from 'react'
import PropTypes from 'prop-types'

import onClickOutsideAddon from 'react-onclickoutside'
import Notification from '../Notification'

class NotificationBox extends Component {

  static propTypes = {
    notifications: PropTypes.array,
    fetchNotifications: PropTypes.func.isRequired,
    toggleNotificationsBox: PropTypes.func.isRequired,
    markAsRead: PropTypes.func.isRequired,
    markAsUnread: PropTypes.func.isRequired
  }

  componentDidMount = () => {
    const { notifications, fetchNotifications } = this.props
    if (!notifications) {
      fetchNotifications()
    }
  }

  handleClickOutside = () => {
    this.props.toggleNotificationsBox()
  }

  render = () => {
    const { notifications, markAsRead, markAsUnread } = this.props
    return <div className='notificationsBox'>
      <div className='notificationsBoxTriangle' />
      <ul className='notifications'>
        {!notifications && <li>loading...</li>}
        {notifications && notifications.slice(0, 10).map(n => {
          return <Notification notification={n}
            markAsRead={markAsRead}
            markAsUnread={markAsUnread}
            key={`notification-${n.id}`} />
        })}
      </ul>
      <a href='/notifications' className='notificationsBoxSeeAll'>See all</a>
    </div>
  }
}

export default onClickOutsideAddon(NotificationBox)
