import React, { PropTypes, Component } from 'react'

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
