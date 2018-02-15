import React, { Component } from 'react'
import PropTypes from 'prop-types'

import onClickOutsideAddon from 'react-onclickoutside'
import Notification from './Notification'
import Loading from './Loading'

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

  hasSomeNotifications = () => {
    const { notifications } = this.props
    return notifications && notifications.length > 0
  }

  showLoading = () => {
    return <li><Loading margin='30px auto' /></li>
  }

  showEmpty = () => {
    return <li className='notificationsEmpty'>
      You have no notifications. <br />
      More time for dancing.
    </li>
  }

  showNotifications = () => {
    const { notifications, markAsRead, markAsUnread } = this.props
    if (!this.hasSomeNotifications()) {
      return this.showEmpty()
    }
    return notifications.slice(0, 10).map(
      n => <Notification notification={n}
        markAsRead={markAsRead}
        markAsUnread={markAsUnread}
        key={`notification-${n.id}`} />
    ).concat([
      <li key='notification-see-all'>
        <a href='/notifications' className='notificationsBoxSeeAll'>
          See all
        </a>
      </li>
    ])
  }

  render = () => {
    const { notifications } = this.props
    return <div className='notificationsBox'>
      <div className='notificationsBoxTriangle' />
      <ul className='notifications'>
        {notifications ? this.showNotifications() : this.showLoading()}
      </ul>
    </div>
  }
}

export default onClickOutsideAddon(NotificationBox)
