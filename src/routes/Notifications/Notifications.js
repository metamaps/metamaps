import React, { Component } from 'react'
import { Link } from 'react-router'

import NotificationsHeader from './NotificationsHeader'

// these come from mailboxer.rb in the api repo
const BLACKLIST = ['ACCESS_REQUEST', 'ACCESS_APPROVED', 'INVITE_TO_EDIT']

/* TODO!!
  pagination
  mark read/unread
  receipts
  fetchNotifications
*/

function getNotificationText (notification) {
  let map, topic, topic1, topic2
  switch (notification.type) {
    case 'ACCESS_APPROVED':
      map = notification.data.map
      return (
        <span>granted your request to edit map <span className="in-bold">{map.name}</span></span>
      )
    case 'ACCESS_REQUEST':
      map = notification.data.map
      return (
        <span>
          wants permission to map with you on <span className="in-bold">{map.name}</span>
          {!notification.data.object.answered && <span>&nbsp;&nbsp;<div className="action">Offer a response</div></span>}
        </span>
      )
    case 'INVITE_TO_EDIT':
      map = notification.data.map
      return (
        <span>
          gave you edit access to map  <span className="in-bold">{map.name}</span>
        </span>
      )
    case 'TOPIC_ADDED_TO_MAP':
      topic = notification.data.topic
      map = notification.data.map
      return (
        <span>
          added topic <span className="in-bold">{topic.name}</span> to map <span className="in-bold">{map.name}</span>
        </span>
      )
    case 'TOPIC_CONNECTED_1':
      topic1 = notification.data.topic1
      topic2 = notification.data.topic2
      return (
        <span>
          connected <span className="in-bold">{topic1.name}</span> to <span className="in-bold">{topic2.name}</span>
        </span>
      )
    case 'TOPIC_CONNECTED_2':
      topic1 = notification.data.topic1
      topic2 = notification.data.topic2
      return (
        <span>
          connected <span className="in-bold">{topic2.name}</span> to <span className="in-bold">{topic1.name}</span>
        </span>
      )
    case 'MESSAGE_FROM_DEVS':
      return (
        <span>
          {notification.subject}
        </span>
      )
    default:
      return null
  }
}

class Notifications extends Component {
  render = () => {
    const notifications = (this.props.notifications || []).filter(n => !(BLACKLIST.indexOf(n.type) > -1 && (!n.data.object || !n.data.map)))
    return (
      <div>
        <div id="yield">
          <div className="centerContent notificationsPage">
            <header className="page-header">
              <h2 className="title">Notifications</h2>
            </header>
            <ul className="notifications">
              {notifications.map(n => {
                // TODO: const receipt = this.props.receipts.find(n => n.notification_id === notification.id)
                const receipt = {
                  is_read: false
                }
                return <Notification key={n.id} notification={n} receipt={receipt} />
              })}
              {notifications.length === 0 && <div className="emptyInbox">
                    You have no notifications. More time for dancing.
              </div>}
            </ul>
          </div>
          {notifications.total_pages > 1 && <div className="centerContent withPadding pagination">
            <Paginate notifications={notifications} />
          </div>}
        </div>
        <NotificationsHeader />
      </div>
    )
  }
}

class Paginate extends Component {
  render = () => {
    return null
  }
}

class Notification extends Component {
  render = () => {
    const { notification, receipt } = this.props
    return (
      <li className={`notification ${receipt.is_read ? 'read' : 'unread' }`} id={`notification-${ notification.id }`}>
        <Link to={`/notifications/${notification.id}`}>
          <div className="notification-actor">
            <img src={notification.actor.image} />
          </div>
          <div className="notification-body">
            <div className="in-bold">{notification.actor.name}</div>
            {getNotificationText(notification)}
          </div>
        </Link>
        <div className="notification-read-unread">
          <a data-remote="true" rel="nofollow" data-method="put" href={`/notifications/${notification.id}/mark_${receipt.is_read ? 'un' : ''}read`}>mark as {receipt.is_read ? 'un' : ''}read</a>
        </div>
        <div className="notification-date">
          {notification.created_at}
        </div>
        <div className="clearfloat"></div>
      </li>
    )
  }
}

export default Notifications
