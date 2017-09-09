import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Toast extends Component {
  static propTypes = {
    message: PropTypes.string
  }

  render () {
    const { message } = this.props
    const html = {__html: message}
    return message ? <p id="toast" className="toast" dangerouslySetInnerHTML={html} /> : null
  }
}

export default Toast
