import React, { Component } from 'react'
import { Link } from 'react-router'

import { MAP_ACCESS_REQUEST } from '../../constants'
import NotificationsHeader from './NotificationsHeader'
import Loading from '../../components/Loading'
import NotificationBody from '../../components/NotificationBody'

/* TODO:
  allow / decline access loading states
  make backend serve HTML for raw body too
*/

class NotificationPage extends Component {
  componentDidMount() {
    // the notification id
    const id  = parseInt(this.props.params.id, 10)
    if (!this.props.notifications.find(n => n.id === id)) {
      this.props.fetchNotification(id)
    }
  }
  render = () => {
    const id  = parseInt(this.props.params.id, 10)
    const notification = this.props.notifications.find(n => n.id === id)
    if (!notification) {
      return (
        <div>
          <div id="yield">
            <div className="centerContent withPadding back">
              <Loading />
            </div>
          </div>
          <NotificationsHeader />
        </div>
      )
    }
    const request = notification.data.object
    const map = notification.data.map
    const subject = notification.type === MAP_ACCESS_REQUEST ?
      (<span><span style={{ fontWeight: 'bold' }} className='requesterName'>{request.user.name}</span> wants to collaborate on map <span style={{fontWeight: 'bold'}}>{ map.name }</span></span>)
      : notification.subject
    return (
      <div>
        <div id="yield">
          <div className="centerContent withPadding back">
            <Link to="/notifications">Back to notifications</Link>
          </div>
          <div className="centerContent notificationPage">
            <h2 className="notification-title">
              <img width="32" height="32" src={notification.actor.image} className='thirty-two-avatar' />
              {subject}
            </h2>
            {notification.type === MAP_ACCESS_REQUEST && <div className="notification-body">
              <p className="main-text">
                {request.answered && <span>
                  {request.approved && <span>You already responded to this access request, and allowed access.</span>}
                  {!request.approved && <span>You already responded to this access request, and declined access. If you changed your mind, you can still grant
                    them access by going to the map and adding them as a collaborator.</span>}
                </span>}
                {!request.answered && <span>
                  <img src='/images/ellipsis.gif' className='hidden' />
                  <a className="button allow" data-remote="true" rel="nofollow" data-method="post" href={`/maps/${map.id}/approve_access/${request.id}`}>Allow</a>
                  <a className="button decline" data-remote="true" rel="nofollow" data-method="post" href={`/maps/${map.id}/deny_access/${request.id}`}>Decline</a>
                </span>}
              </p>
              <Link to={`/maps/${map.id}`}>Go to map</Link>
              &nbsp;&nbsp;
              <Link to={`/explore/mapper/${request.user.id}`}>View mapper profile</Link>
            </div>}
            {notification.type !== MAP_ACCESS_REQUEST && <NotificationBody notification={notification} />}
          </div>
        </div>
        <NotificationsHeader />
      </div>
    )
  }
}

export default NotificationPage

/*
<script>
               $(document).ready(function() {
                 $('.notification-body .button').click(function() {
                   $(this).html('<img src="{ asset_path('ellipsis.gif') }" />')
                 })
               })
             </script>
             */