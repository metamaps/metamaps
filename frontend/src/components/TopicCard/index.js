import React, { PropTypes, Component } from 'react'

import Title from './Title'
import Links from './Links'
import Desc from './Desc'
import Attachments from './Attachments'
import Follow from './Follow'
import Util from '../../Metamaps/Util'

class ReactTopicCard extends Component {
  render = () => {
    const { currentUser, onTopicFollow, updateTopic } = this.props
    const topic = this.props.openTopic

    if (!topic) return null

    const wrappedUpdateTopic = obj => updateTopic(topic, obj)
    const wrappedTopicFollow = () => onTopicFollow(topic)

    const authorizedToEdit = topic.authorizeToEdit(currentUser)
    const isFollowing = topic.isFollowedBy(currentUser)
    const hasAttachment = topic.get('link') && topic.get('link') !== ''

    let classname = 'permission'
    if (authorizedToEdit) {
      classname += ' canEdit'
    } else {
      classname += ' cannotEdit'
    }
    if (topic.authorizePermissionChange(currentUser)) classname += ' yourTopic'

    return (
      <div className="showcard mapElement mapElementHidden" id="showcard">
        <div className={classname}>
          <div className={`CardOnGraph ${hasAttachment ? 'hasAttachment' : ''}`} id={`topic_${topic.id}`}>
            <Title name={topic.get('name')}
              authorizedToEdit={authorizedToEdit}
              onChange={wrappedUpdateTopic}
            />
            <Links topic={topic}
              ActiveMapper={this.props.currentUser}
              updateTopic={wrappedUpdateTopic}
              metacodeSets={this.props.metacodeSets}
              redrawCanvas={this.props.redrawCanvas}
            />
            <Desc desc={topic.get('desc')}
              authorizedToEdit={authorizedToEdit}
              onChange={wrappedUpdateTopic}
            />
            <Attachments topic={topic}
              authorizedToEdit={authorizedToEdit}
              updateTopic={wrappedUpdateTopic}
            />
          {Util.isTester(currentUser) && <Follow isFollowing={isFollowing} onTopicFollow={wrappedTopicFollow} />}
            <div className="clearfloat"></div>
          </div>
        </div>
      </div>
    )
  }
}

ReactTopicCard.propTypes = {
  openTopic: PropTypes.object,
  currentUser: PropTypes.object,
  updateTopic: PropTypes.func,
  onTopicFollow: PropTypes.func,
  metacodeSets: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    metacodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      icon_path: PropTypes.string, // url
      name: PropTypes.string
    }))
  })),
  redrawCanvas: PropTypes.func
}

export default ReactTopicCard
