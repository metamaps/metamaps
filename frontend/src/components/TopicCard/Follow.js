import React, { PropTypes, Component } from 'react'

class Follow extends Component {
  render = () => {
    const { isFollowing, onFollow } = this.props
    return <div className='topicFollow' onClick={onFollow}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </div>
  }
}

Follow.propTypes = {
  isFollowing: PropTypes.bool,
  onFollow: PropTypes.func
}

export default Follow
