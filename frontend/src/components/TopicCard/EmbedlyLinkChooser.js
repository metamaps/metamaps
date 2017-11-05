import React, { Component } from 'react'
import PropTypes from 'prop-types'

class EmbedlyLinkChooser extends Component {
  constructor(props) {
    super(props)

    this.state = {
      linkEdit: ''
    }
  }

  resetLink = () => {
    this.setState({ linkEdit: '' })
    this.props.cancel()
  }

  onLinkChangeHandler = e => {
    this.setState({ linkEdit: e.target.value })
  }

  onLinkKeyUpHandler = e => {
    const ENTER_KEY = 13
    if (e.which === ENTER_KEY) {
      const { linkEdit } = this.state
      this.setState({ linkEdit: '' })
      this.props.updateTopic({ link: linkEdit })
    }
  }

  render = () => {
    const { linkEdit } = this.state

    return (
      <div className="link-chooser">
        <div className="addLink">
          <div id="addLinkIcon"></div>
          <div id="addLinkInput">
            <input ref={input => (this.linkInput = input)}
              placeholder="Enter or paste a link"
              value={linkEdit}
              onChange={this.onLinkChangeHandler}
              onKeyUp={this.onLinkKeyUpHandler}></input>
            <div className="attachment-cancel" onClick={this.resetLink}></div>
          </div>
        </div>
      </div>
    )
  }
}

EmbedlyLinkChooser.propTypes = {
  updateTopic: PropTypes.func,
  cancel: PropTypes.func
}

export default EmbedlyLinkChooser
