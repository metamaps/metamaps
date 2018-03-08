import React, { Component } from 'react'
import { Link } from 'react-router'

import { MAP_ACCESS_REQUEST } from '../../constants'
import NotificationsHeader from './NotificationsHeader'
import LoadingPage from '../helpers/LoadingPage'
import Loading from '../../components/Loading'
import NotificationBody from '../../components/NotificationBody'

class NotificationPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      allowPending: false,
      declinePending: false,
      allowed: false,
      declined: false,
      error: false
    }
  }

  componentDidMount() {
    // the notification id
    const id  = parseInt(this.props.params.id, 10)
    if (!this.props.notifications.find(n => n.id === id)) {
      this.props.fetchNotification(id)
    }
  }

  deny = async () => {
    const id  = parseInt(this.props.params.id, 10)
    const notification = this.props.notifications.find(n => n.id === id)
    const request = notification.data.object
    const map = notification.data.map
    this.setState({ declinePending: true })
    const success = await this.props.denyAccessRequest(map.id, request.id)
    if (success) {
      this.setState({ declined: true, declinePending: false })
    } else {
      this.setState({ error: true })
    }
  }

  approve = async () => {
    const id  = parseInt(this.props.params.id, 10)
    const notification = this.props.notifications.find(n => n.id === id)
    const request = notification.data.object
    const map = notification.data.map
    this.setState({ allowPending: true })
    const success = await this.props.approveAccessRequest(map.id, request.id)
    if (success) {
      this.setState({ allowed: true, allowPending: false })
    } else {
      this.setState({ error: true })
    }
  }

  render = () => {
    const id  = parseInt(this.props.params.id, 10)
    const notification = this.props.notifications.find(n => n.id === id)
    if (!notification) {
      return (
        <div>
          <LoadingPage />
          <NotificationsHeader />
        </div>
      )
    }
    const request = notification.data.object
    const map = notification.data.map
    const subject = notification.type === MAP_ACCESS_REQUEST ?
      (<span><span style={{ fontWeight: 'bold' }} className='requesterName'>{notification.actor.name}</span> wants to collaborate on map <span style={{fontWeight: 'bold'}}>{ map.name }</span></span>)
      : notification.subject
    const localAnswered = this.state.allowed || this.state.declined
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
              <div className="main-text">
                {this.state.error && <div className="accessRequestError">There was an error, please refresh and try again</div>}
                {request.answered && <div>
                  {request.approved && <span>You already responded to this access request, and allowed access.</span>}
                  {!request.approved && <span>You already responded to this access request, and declined access. If you changed your mind, you can still grant
                    them access by going to the map and adding them as a collaborator.</span>}
                </div>}
                {!localAnswered && !request.answered && <div>
                  <img src='/images/ellipsis.gif' className='hidden' />
                  {!this.state.declined && !this.state.declinePending && <button onClick={this.approve} className="button allow">
                    {this.state.allowPending ? <img src='/images/ellipsis.gif' /> : 'Allow'}
                  </button>}
                  {!this.state.allowed && !this.state.allowPending && <button onClick={this.deny} className="button decline">
                    {this.state.declinePending ? <img src='/images/ellipsis.gif' /> : 'Decline'}
                  </button>}
                </div>}
                {this.state.allowed && <div>
                  {notification.actor.name} has been shared on the map and notified.
                </div>}
                {this.state.declined && <div>
                  Fair enough.
                </div>}
              </div>
              <div>
                <Link to={`/maps/${map.id}`}>Go to map</Link>
                &nbsp;&nbsp;
                <Link to={`/explore/mapper/${notification.actor.id}`}>View mapper profile</Link>
              </div>
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