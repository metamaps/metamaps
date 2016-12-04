import React, { PropTypes, Component } from 'react'

class NotificationIcon extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render = () => {
    var linkClasses = "notificationsIcon upperRightEl upperRightIcon "
    
    if (this.props.unreadNotificationsCount > 0) {
      linkClasses += "unread"
    } else {
      linkClasses += "read"
    }
    
    return (
      <a className={linkClasses} href="/notifications">
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

NotificationIcon.propTypes = {
  unreadNotificationsCount: PropTypes.number
}

export default NotificationIcon
