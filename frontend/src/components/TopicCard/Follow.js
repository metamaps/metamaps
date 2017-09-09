import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Follow extends Component {
  render = () => {
    const { isFollowing, onTopicFollow } = this.props
    return <div className='topicFollow' onClick={onTopicFollow}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </div>
  }
}

Follow.propTypes = {
  isFollowing: PropTypes.bool,
  onTopicFollow: PropTypes.func
}

export default Follow
