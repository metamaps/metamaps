import React, { Component } from 'react'
import PropTypes from 'prop-types'

import onClickOutsideAddon from 'react-onclickoutside'
import Notification from '../Notification'
import Loading from '../Loading'

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
    const empty = notifications && notifications.length === 0
    return <div className='notificationsBox'>
      <div className='notificationsBoxTriangle' />
      <ul className='notifications'>
        {!notifications && <li><Loading margin='30px auto' /></li>}
        {empty ? (
          <li className='notificationsEmpty'>
            You have no notifications. <br />
            More time for dancing.
          </li>
        ) : (
          notifications.slice(0, 10).map(n => <Notification notification={n}
              markAsRead={markAsRead}
              markAsUnread={markAsUnread}
              key={`notification-${n.id}`} />)
        )}
      </ul>
      {notifications && !empty && <a href='/notifications'
        className='notificationsBoxSeeAll'>
        See all
      </a>}
    </div>
  }
}

export default onClickOutsideAddon(NotificationBox)
