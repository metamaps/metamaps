import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Instructions extends Component {

  static propTypes = {
    mobile: PropTypes.bool,
    hasLearnedTopicCreation: PropTypes.bool
  }

  render() {
    const { hasLearnedTopicCreation, mobile } = this.props
    return hasLearnedTopicCreation ? null : <div id="instructions">
      {!mobile && <div className="addTopic">
        Double-click to<br/>add a topic
      </div>}
      {mobile && <div className="addTopic">
        Double-tap to<br/>add a topic
      </div>}
    </div>
  }
}

export default Instructions
