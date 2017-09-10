import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Follow extends Component {
  render = () => {
    const { ActiveMapper, isFollowing, onTopicFollow } = this.props
    return <div className='topicFollow' onClick={() => ActiveMapper && onTopicFollow()}>
      {ActiveMapper ? isFollowing ? 'Unfollow' : 'Follow' : ''}
    </div>
  }
}

Follow.propTypes = {
  isFollowing: PropTypes.bool,
  onTopicFollow: PropTypes.func,
  ActiveMapper: PropTypes.object
}

export default Follow
