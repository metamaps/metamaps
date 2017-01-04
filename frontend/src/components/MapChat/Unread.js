import React from 'react'

const Unread = props => {
  return props.count ? <div className="chat-unread">{props.count}</div> : null
}

export default Unread
