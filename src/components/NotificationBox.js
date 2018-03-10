import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import onClickOutsideAddon from 'react-onclickoutside'
import Notification from './Notification'
import Loading from './Loading'

class NotificationBox extends Component {
  static propTypes = {
    notifications: PropTypes.array,
    loading: PropTypes.bool.isRequired,
    fetchNotifications: PropTypes.func.isRequired,
    toggleNotificationsBox: PropTypes.func.isRequired,
    markAsRead: PropTypes.func.isRequired,
    markAsUnread: PropTypes.func.isRequired
  }

  componentDidMount = () => {
    this.props.fetchNotifications()
  }

  handleClickOutside = () => {
    this.props.toggleNotificationsBox()
  }

  hasSomeNotifications = () => {
    const { notifications } = this.props
    return notifications.length > 0
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
        key={`notification-${n.id}`}
        onClick={() => this.props.toggleNotificationsBox()} />
    ).concat([
      <li key='notification-see-all'>
        <Link to='/notifications' className='notificationsBoxSeeAll' onClick={() => this.props.toggleNotificationsBox()}>
          See all
        </Link>
      </li>
    ])
  }

  render = () => {
    const { notifications, loading } = this.props
    return <div className='notificationsBox'>
      <div className='notificationsBoxTriangle' />
      <ul className='notifications'>
        {notifications.length === 0 && loading ?  this.showLoading() : this.showNotifications()}
      </ul>
    </div>
  }
}

export default onClickOutsideAddon(NotificationBox)
