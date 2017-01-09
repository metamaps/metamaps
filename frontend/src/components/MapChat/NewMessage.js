import React, { PropTypes, Component } from 'react'
import { Picker } from 'emoji-mart'
import Util from '../../Metamaps/Util'

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

  textAreaValue = () => {
    return Util.addEmoji(this.props.messageText)
  }

  handleClick = (emoji, event) => {
    const { messageText } = this.props
    this.props.handleChange({ target: {
      value: messageText + emoji.colons
    }})

    this.setState({ showEmojiPicker: false })
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
          <span className="emoji-picker-button" onClick={this.toggleEmojiPicker}>🙃</span>
        </div>
        <textarea value={this.textAreaValue()}
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
