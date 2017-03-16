import React, { PropTypes, Component } from 'react'

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
