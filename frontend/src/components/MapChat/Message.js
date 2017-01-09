import React from 'react'
import Autolinker from 'autolinker'
import Util from '../../Metamaps/Util'

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
  const { user_image, user_name, message, created_at, heading } = props
  const messageHtml = {__html: linker.link(Util.addEmoji(message, { emoticons: false }))}

  return (
    <div className="chat-message">
      <div className="chat-message-user">
        {heading && <img src={user_image} />}
      </div>
      {heading && <div className="chat-message-meta">
        <span className='chat-message-username'>{user_name}</span>&nbsp;
        <span className='chat-message-time'>{formatDate(created_at)}</span>
      </div>}
      <div className="chat-message-text" dangerouslySetInnerHTML={messageHtml}></div>
      <div className="clearfloat"></div>
    </div>
  )
}

export default Message
