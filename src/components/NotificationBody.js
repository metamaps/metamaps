import React, { Component } from 'react'
import outdent from 'outdent'

import {
  MAP_ACCESS_REQUEST,
  MAP_ACCESS_APPROVED,
  MAP_INVITE_TO_EDIT,
  TOPIC_ADDED_TO_MAP,
  TOPIC_CONNECTED_1,
  TOPIC_CONNECTED_2,
  MESSAGE_FROM_DEVS
} from '../constants'

class NotificationBody extends Component {
  notificationTextHtml = () => {
    const { notification } = this.props
    let map, topic, topic1, topic2
    let result =  `<div class='in-bold'>${notification.actor.name}</div>`

    switch (notification.type) {
      case MAP_ACCESS_APPROVED:
        map = notification.data.map
        result += outdent`granted your request to edit map
                 <span class='in-bold'>${map.name}</span>`
        break
      case MAP_ACCESS_REQUEST:
        map = notification.data.map
        result += outdent`wants permission to map with you on
                 <span class='in-bold'>${map.name}</span>`
        if (!notification.data.object.answered) {
          result += '<br /><div class="action">Offer a response</div>'
        }
        break
      case MAP_INVITE_TO_EDIT:
        map = notification.data.map
        result += outdent`gave you edit access to map
                 <span class='in-bold'>${map.name}</span>`
        break
      case TOPIC_ADDED_TO_MAP:
        map = notification.data.map
        topic = notification.data.topic
        result += outdent`added topic <span class='in-bold'>${topic.name}</span>
                 to map <span class='in-bold'>${map.name}</span>`
        break
      case TOPIC_CONNECTED_1:
        topic1 = notification.data.topic1
        topic2 = notification.data.topic2
        result += outdent`connected <span class='in-bold'>${topic1.name}</span>
                 to <span class='in-bold'>${topic2.name}</span>`
        break
      case TOPIC_CONNECTED_2:
        topic1 = notification.data.topic1
        topic2 = notification.data.topic2
        result += outdent`connected <span class='in-bold'>${topic2.name}</span>
                 to <span class='in-bold'>${topic1.name}</span>`
        break
      case MESSAGE_FROM_DEVS:
        result += notification.subject
    }
    return {__html: result}
  }

  render = () => {
    return (
      <div className='notification-body' dangerouslySetInnerHTML={this.notificationTextHtml()} />
    )
  }
}

export default NotificationBody