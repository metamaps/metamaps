import React, { Component } from 'react'
import PropTypes from 'prop-types'

import onClickOutsideAddon from 'react-onclickoutside'

class NotificationBox extends Component {

  static propTypes = {
    notifications: PropTypes.array,
    fetchNotifications: PropTypes.func.isRequired,
    toggleNotificationsBox: PropTypes.func.isRequired
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
    const { notifications } = this.props
    return <div className='notificationsBox'>
      <div className='notificationsBoxTriangle' />
      <ul>
        {!notifications && <li>loading...</li>}
        <li>A notification</li>
        <li>A notification</li>
        <li>A notification</li>
        <li>A notification</li>
      </ul>
      <a href='/notifications' className='notificationsBoxSeeAll'>See all</a>
    </div>
  }
}

export default onClickOutsideAddon(NotificationBox)
