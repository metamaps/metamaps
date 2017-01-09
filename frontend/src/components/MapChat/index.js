import React, { PropTypes, Component } from 'react'
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
      unreadMessages: 0,
      open: false,
      messageText: '',
      alertSound: true, // whether to play sounds on arrival of new messages or not
      cursorsShowing: true,
      videosShowing: true
    }
  }

  reset = () => {
    this.setState({
      unreadMessages: 0,
      open: false,
      messageText: '',
      alertSound: true, // whether to play sounds on arrival of new messages or not
      cursorsShowing: true,
      videosShowing: true
    })
  }

  close = () => {
    this.setState({open: false})
    this.props.onClose()
    this.messageInput.blur()
  }

  open = () => {
    this.scroll()
    this.setState({open: true, unreadMessages: 0})
    this.props.onOpen()
    this.messageInput.focus()
  }

  newMessage = () => {
    if (!this.state.open) this.setState({unreadMessages: this.state.unreadMessages + 1})
  }

  scroll = () => {
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
  }

  toggleDrawer = () => {
    if (this.state.open) this.close()
    else if (!this.state.open) this.open()
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
    const rightOffset = this.state.open ? '0' : '-300px'
    const { conversationLive, isParticipating, participants, messages, inviteACall, inviteToJoin } = this.props
    const { videosShowing, cursorsShowing, alertSound, unreadMessages } = this.state
    return (
      <div className="chat-box"
        style={{ right: rightOffset }}
      >
        <div className="junto-header">
          PARTICIPANTS
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
          CHAT
          <div onClick={this.toggleAlertSound} className={`sound-toggle ${alertSound ? '' : 'active'}`}></div>
        </div>
        <div className={`chat-button ${conversationLive ? 'active' : ''}`} onClick={this.toggleDrawer}>
          <div className="tooltips">Chat</div>
          <Unread count={unreadMessages} />
        </div>
        <div className="chat-messages" ref={div => { this.messagesDiv = div }}>
          {makeList(messages)}
        </div>
        <NewMessage textAreaProps={{
          className: 'chat-input',
          ref: textarea => { this.messageInput = textarea },
          placeholder: 'Send a message...',
          onKeyUp: this.handleTextareaKeyUp,
          onFocus: this.props.inputFocus,
          onBlur: this.props.inputBlur
        }}
          handleChange={this.handleChange('messageText')}
          messageText={this.state.messageText}
        />
      </div>
    )
  }
}

MapChat.propTypes = {
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
