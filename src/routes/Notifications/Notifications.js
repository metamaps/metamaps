import React, { Component } from 'react'
import { Link } from 'react-router'

import LoadingPage from '../helpers/LoadingPage'
import Notification from '../../components/Notification'

import {
  MAP_ACCESS_REQUEST,
  MAP_ACCESS_APPROVED,
  MAP_INVITE_TO_EDIT
} from '../../constants'
import NotificationsHeader from './NotificationsHeader'

const BLACKLIST = [MAP_ACCESS_REQUEST, MAP_ACCESS_APPROVED, MAP_INVITE_TO_EDIT]

/* TODO!!
  pagination
*/



class Notifications extends Component {
  componentDidMount = () => {
    this.props.fetchNotifications()
  }

  render = () => {
    const { notificationsLoading, markAsRead, markAsUnread } = this.props
    const notifications = (this.props.notifications || []).filter(n => !(BLACKLIST.indexOf(n.type) > -1 && (!n.data.object || !n.data.map)))
    if (notifications.length === 0 && notificationsLoading) {
      return (
        <div>
          <LoadingPage />
          <NotificationsHeader />
        </div>
      )
    }
    return (
      <div>
        <div id="yield">
          <div className="centerContent notificationsPage">
            <header className="page-header">
              <h2 className="title">Notifications</h2>
            </header>
            <ul className="notifications">
              {notifications.map(n => {
                return (
                  <Notification key={`notification-${n.id}`}
                    notification={n}
                    markAsRead={markAsRead}
                    markAsUnread={markAsUnread} />
                )
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

export default Notifications
