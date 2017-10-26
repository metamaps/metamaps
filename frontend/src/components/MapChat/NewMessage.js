import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Emoji, Picker } from 'emoji-mart'

class NewMessage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showEmojiPicker: false
    }
  }

  toggleEmojiPicker = () => {
    this.setState({ showEmojiPicker: !this.state.showEmojiPicker })
  }

  handleClick = (emoji, event) => {
    const { messageText } = this.props
    this.props.handleChange({ target: {
      value: messageText + emoji.colons
    }})

    this.setState({ showEmojiPicker: false })
    this.props.focusMessageInput()
  }

  render = () => {
    return (
      <div className="new-message-area">
        <Picker set="emojione"
          onClick={this.handleClick}
          style={{
            display: this.state.showEmojiPicker ? 'block' : 'none',
            maxWidth: '100%'
          }}
          emoji="upside_down_face"
          title="Emoji"
        />
        <div className="extra-message-options">
          <span className="emoji-picker-button" onClick={this.toggleEmojiPicker}><Emoji size={24} emoji="upside_down_face" /></span>
        </div>
        <textarea value={this.props.messageText}
          onChange={this.props.handleChange}
          {...this.props.textAreaProps}
        />
      </div>
    )
  }
}

NewMessage.propTypes = {
  messageText: PropTypes.string,
  handleChange: PropTypes.func,
  focusMessageInput: PropTypes.func,
  textAreaProps: PropTypes.shape({
    className: PropTypes.string,
    ref: PropTypes.func,
    placeholder: PropTypes.string,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func
  })
}

export default NewMessage
