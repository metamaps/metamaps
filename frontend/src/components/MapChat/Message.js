import React from 'react'
import Autolinker from 'autolinker'

const linker = new Autolinker({ newWindow: true, truncate: 50, email: false, phone: false })

function addZero(i) {
  if (i < 10) {
    i = '0' + i
  }
  return i
}

function formatDate(created_at) {
  let date = new Date(created_at)
  let formatted = (date.getMonth() + 1) + '/' + date.getDate()
  formatted += ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes())
  return formatted
}

const Message = props => {
  const { user_image, user_name, message, created_at } = props
  const messageHtml = {__html: linker.link(message)}
  return (
    <div className="chat-message">
      <div className="chat-message-user">
        <img src={user_image} title={user_name} />
      </div>
      <div className="chat-message-text" dangerouslySetInnerHTML={messageHtml}></div>
      <div className="chat-message-time">{formatDate(created_at)}</div>
      <div className="clearfloat"></div>
    </div>
  )
}

export default Message
