import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Unread from './Unread'
import Participant from './Participant'
import Message from './Message'
import NewMessage from './NewMessage'
import Util from '../../Metamaps/Util'

function makeList(messages) {
  let currentHeader
  return messages ? messages.map(m => {
    let heading = false
    if (!currentHeader) {
      heading = true
      currentHeader = m
    } else {
      // not same user or time diff of greater than 3 minutes
      heading = m.user_id !== currentHeader.user_id || Math.floor(Math.abs(new Date(currentHeader.created_at) - new Date(m.created_at)) / 60000) > 3
      currentHeader = heading ? m : currentHeader
    }
    return <Message {...m} key={m.id} heading={heading}/>
  }) : null
}

class MapChat extends Component {
  constructor(props) {
    super(props)

    this.state = {
      messageText: '',
      alertSound: true, // whether to play sounds on arrival of new messages or not
      cursorsShowing: true,
      videosShowing: true
    }
  }

  componentDidUpdate(prevProps) {
    const { messages } = this.props
    const prevMessages = prevProps.messages
    if (messages.length !== prevMessages.length) setTimeout(() => this.scroll(), 50)
  }

  reset = () => {
    this.setState({
      messageText: '',
      alertSound: true, // whether to play sounds on arrival of new messages or not
      cursorsShowing: true,
      videosShowing: true
    })
  }

  close = () => {
    this.props.onClose()
  }

  open = () => {
    this.props.onOpen()
    setTimeout(() => this.scroll(), 50)
  }

  scroll = () => {
    // hack: figure out how to do this right
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight + 100
  }

  toggleDrawer = () => {
    if (this.props.chatOpen) this.close()
    else if (!this.props.chatOpen) this.open()
  }

  toggleAlertSound = () => {
    this.setState({alertSound: !this.state.alertSound})
    this.props.soundToggleClick()
  }

  toggleCursorsShowing = () => {
    this.setState({cursorsShowing: !this.state.cursorsShowing})
    this.props.cursorToggleClick()
  }

  toggleVideosShowing = () => {
    this.setState({videosShowing: !this.state.videosShowing})
    this.props.videoToggleClick()
  }

  handleChange = key => e => {
    this.setState({
      [key]: e.target.value
    })
  }

  handleTextareaKeyUp = e => {
    if (e.which === 13) {
      e.preventDefault()
      const text = Util.removeEmoji(this.state.messageText)
      this.props.handleInputMessage(text)
      this.setState({ messageText: '' })
    }
  }

  render = () => {
    const { unreadMessages, chatOpen, conversationLive,
            isParticipating, participants, messages, inviteACall, inviteToJoin } = this.props
    const { videosShowing, cursorsShowing, alertSound } = this.state
    return (
      <div className="chat-box">
        <div className={`chat-button ${conversationLive ? 'active' : ''}`} onClick={this.toggleDrawer}>
          <div className="tooltips">Chat</div>
          <Unread count={unreadMessages} />
        </div>
        {chatOpen && <div className="chat-panel">
          <div className="junto-header">
            Participants
            <div onClick={this.toggleVideosShowing} className={`video-toggle ${videosShowing ? '' : 'active'}`} />
            <div onClick={this.toggleCursorsShowing} className={`cursor-toggle ${cursorsShowing ? '' : 'active'}`} />
          </div>
          <div className="participants">
            {conversationLive && <div className="conversation-live">
              LIVE
              {isParticipating && <span className="call-action leave" onClick={this.props.leaveCall}>
                LEAVE
              </span>}
              {!isParticipating && <span className="call-action join" onClick={this.props.joinCall}>
                JOIN
              </span>}
            </div>}
            {participants.map(participant => <Participant
              key={participant.id}
              {...participant}
              inviteACall={inviteACall}
              inviteToJoin={inviteToJoin}
              conversationLive={conversationLive}
              mapperIsLive={isParticipating}/>
            )}
          </div>
          <div className="chat-header">
            Chat
            <div onClick={this.toggleAlertSound} className={`sound-toggle ${alertSound ? '' : 'active'}`}></div>
          </div>
          <div className="chat-messages" ref={div => { this.messagesDiv = div }}>
            {makeList(messages)}
          </div>
          <NewMessage messageText={this.state.messageText}
            focusMessageInput={this.focusMessageInput}
            handleChange={this.handleChange('messageText')}
            textAreaProps={{
              className: 'chat-input',
              ref: textarea => { textarea && textarea.focus() },
              placeholder: 'Send a message...',
              onKeyUp: this.handleTextareaKeyUp,
              onFocus: this.props.inputFocus,
              onBlur: this.props.inputBlur
            }}
          />
        </div>}
      </div>
    )
  }
}

MapChat.propTypes = {
  unreadMessages: PropTypes.number,
  chatOpen: PropTypes.bool,
  conversationLive: PropTypes.bool,
  isParticipating: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  leaveCall: PropTypes.func,
  joinCall: PropTypes.func,
  inviteACall: PropTypes.func,
  inviteToJoin: PropTypes.func,
  videoToggleClick: PropTypes.func,
  cursorToggleClick: PropTypes.func,
  soundToggleClick: PropTypes.func,
  participants: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string, // css color
    id: PropTypes.number,
    image: PropTypes.string, // image url
    self: PropTypes.bool,
    username: PropTypes.string,
    isParticipating: PropTypes.bool,
    isPending: PropTypes.bool
  }))
}

export default MapChat
