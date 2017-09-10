import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Participant extends Component {
  render() {
    const { conversationLive, mapperIsLive, isParticipating, isPending, id, self, image, username, color } = this.props
    return (
      <div className={`participant participant-${id} ${self ? 'is-self' : ''}`}>
        <div className="chat-participant-image">
          <img src={image} style={{ border: `2px solid ${color}` }} />
        </div>
        <div className="chat-participant-name">
          {username} {self ? '(me)' : ''}
        </div>
        {!self && !conversationLive && <button
          className={`button chat-participant-invite-call ${isPending ? 'pending' : ''}`}
          onClick={() => !isPending && this.props.inviteACall(id)} // Realtime.inviteACall(id)
        />}
        {!self && mapperIsLive && !isParticipating && <button
          className={`button chat-participant-invite-join ${isPending ? 'pending' : ''}`}
          onClick={() => !isPending && this.props.inviteToJoin(id)} // Realtime.inviteToJoin(id)
        />}
        {isParticipating && <span className="chat-participant-participating">
          <div className="green-dot"></div>
        </span>}
        <div className="clearfloat"></div>
      </div>
    )
  }
}

Participant.propTypes = {
  conversationLive: PropTypes.bool,
  mapperIsLive: PropTypes.bool,
  isParticipating: PropTypes.bool,
  isPending: PropTypes.bool,
  color: PropTypes.string, // css color
  id: PropTypes.number,
  image: PropTypes.string, // image url
  self: PropTypes.bool,
  username: PropTypes.string,
  inviteACall: PropTypes.func,
  inviteToJoin: PropTypes.func
}

export default Participant
