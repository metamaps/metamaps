import React, { Component } from 'react'
import PropTypes from 'prop-types'
import outdent from 'outdent'

class Notification extends Component {
  static propTypes = {
    markAsRead: PropTypes.func,
    markAsUnread: PropTypes.func,
    notification: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      is_read: PropTypes.bool.isRequired,
      created_at: PropTypes.string.isRequired,
      actor: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        admin: PropTypes.boolean
      }),
      object: PropTypes.object,
      map: PropTypes.object,
      topic: PropTypes.object,
      topic1: PropTypes.object,
      topic2: PropTypes.object
    })
  }

  notificationTextHtml = () => {
    const { notification } = this.props
    let map, topic, topic1, topic2
    let result = `<div class='in-bold'>${notification.actor.name}</div>`

    switch (notification.type) {
      case 'ACCESS_APPROVED':
        map = notification.data.map
        result += outdent`granted your request to edit map
                 <span class='in-bold'>${map.name}</span>`
        break
      case 'ACCESS_REQUEST':
        map = notification.data.map
        result += outdent`wants permission to map with you on
                 <span class='in-bold'>${map.name}</span>`
        if (!notification.data.object.answered) {
          result += '<br /><div class="action">Offer a response</div>'
        }
        break
      case 'INVITE_TO_EDIT':
        map = notification.data.map
        result += outdent`gave you edit access to map
                 <span class='in-bold'>${map.name}</span>`
        break
      case 'TOPIC_ADDED_TO_MAP':
        map = notification.data.map
        topic = notification.data.topic
        result += outdent`added topic <span class='in-bold'>${topic.name}</span>
                 to map <span class='in-bold'>${map.name}</span>`
        break
      case 'TOPIC_CONNECTED_1':
        topic1 = notification.data.topic1
        topic2 = notification.data.topic2
        result += outdent`connected <span class='in-bold'>${topic1.name}</span>
                 to <span class='in-bold'>${topic2.name}</span>`
        break
      case 'TOPIC_CONNECTED_2':
        topic1 = notification.data.topic1
        topic2 = notification.data.topic2
        result += outdent`connected <span class='in-bold'>${topic2.name}</span>
                 to <span class='in-bold'>${topic1.name}</span>`
        break
      case 'MESSAGE_FROM_DEVS':
        result += notification.subject
    }
    return {__html: result}
  }

  getDate = () => {
    const { notification: {created_at} } = this.props
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const created = new Date(created_at)
    return `${months[created.getMonth()]} ${created.getDate()}`
  }

  markAsRead = () => {
    const { notification, markAsRead } = this.props
    markAsRead(notification.id)
  }

  markAsUnread = () => {
    const { notification, markAsUnread } = this.props
    markAsUnread(notification.id)
  }

  render = () => {
    const { notification } = this.props
    const classes = `notification ${notification.is_read ? 'read' : 'unread'}`

    if (!notification.data.object) {
      return null
    }

    return <li className={classes}>
      <a href={`/notifications/${notification.id}`}>
        <div className='notification-actor'>
          <img src={notification.actor.image} />
        </div>
        <div className='notification-body'
             dangerouslySetInnerHTML={this.notificationTextHtml()} />
      </a>
      <div className='notification-read-unread'>
        {!notification.is_read && <div onClick={this.markAsRead}>
          mark read
        </div>}
        {notification.is_read && <div onClick={this.markAsUnread}>
          mark unread
        </div>}
      </div>
      <div className='notification-date'>
        {this.getDate()}
      </div>
      <div className='clearfloat'></div>
    </li>
  }
}

export default Notification
