import React, { PropTypes, Component } from 'react'

class NotificationIcon extends Component {

  static propTypes = {
    unreadNotificationsCount: PropTypes.number
  }

  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render = () => {
    let linkClasses = 'notificationsIcon upperRightEl upperRightIcon '

    if (this.props.unreadNotificationsCount > 0) {
      linkClasses += 'unread'
    } else {
      linkClasses += 'read'
    }

    return (
      <a className={linkClasses} href="/notifications" target="_blank">
        <div className="tooltipsUnder">
          Notifications
        </div>
        {this.props.unreadNotificationsCount === 0 ? null : (
          <div className="unread-notifications-dot"></div>
        )}
      </a>

    )
  }
}

export default NotificationIcon
