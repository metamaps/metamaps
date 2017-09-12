import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Follow extends Component {
  render = () => {
    const { ActiveMapper, isFollowing, onTopicFollow } = this.props
    function onClick () {
      if (ActiveMapper) {
        onTopicFollow()
      }
    }
    let innerValue
    // only display either option if there is a user signed in
    if (ActiveMapper) {
      innerValue = isFollowing ? 'Unfollow' : 'Follow'
    }
    return <div className='topicFollow' onClick={onClick}>
      {innerValue}
    </div>
  }
}

Follow.propTypes = {
  isFollowing: PropTypes.bool,
  onTopicFollow: PropTypes.func,
  ActiveMapper: PropTypes.object
}

export default Follow
