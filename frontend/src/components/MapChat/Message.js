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

function formatDate(createdAt) {
  let date = new Date(createdAt)
  let formatted = (date.getMonth() + 1) + '/' + date.getDate()
  formatted += ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes())
  return formatted
}

const Message = props => {
  const { user_image: userImage, user_name: userName, message, created_at: createdAt, heading } = props
  const messageHtml = {__html: linker.link(Util.addEmoji(message, { emoticons: false }))}

  return (
    <div className="chat-message">
      <div className="chat-message-user">
        {heading && <img src={userImage} />}
      </div>
      {heading && <div className="chat-message-meta">
        <span className='chat-message-username'>{userName}</span>&nbsp;
        <span className='chat-message-time'>{formatDate(createdAt)}</span>
      </div>}
      <div className="chat-message-text" dangerouslySetInnerHTML={messageHtml}></div>
      <div className="clearfloat"></div>
    </div>
  )
}

export default Message
