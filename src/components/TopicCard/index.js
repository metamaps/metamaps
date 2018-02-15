import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'

import Title from './Title'
import Links from './Links'
import Desc from './Desc'
import Attachments from './Attachments'
import Info from './Info'

class ReactTopicCard extends Component {
  render = () => {
    const { currentUser, onTopicFollow, updateTopic } = this.props
    const topic = this.props.openTopic

    if (!topic) return null

    const wrappedUpdateTopic = obj => updateTopic(topic, obj)

    const authorizedToEdit = topic.authorizeToEdit(currentUser)
    const hasAttachment = topic.get('link') && topic.get('link') !== ''

    let classname = 'permission'
    if (authorizedToEdit) {
      classname += ' canEdit'
    } else {
      classname += ' cannotEdit'
    }
    if (topic.authorizePermissionChange(currentUser)) classname += ' yourTopic'

    return (
      <Draggable handle='.metacodeImage' defaultPosition={{x: 100, y: 100}}>
        <div className='showcard mapElement mapElementHidden'>
          <div className={classname}>
            <div className={`CardOnGraph ${hasAttachment ? 'hasAttachment' : ''}`} id={`topic_${topic.id}`}>
              <Links topic={topic}
                onTopicFollow={onTopicFollow}
                ActiveMapper={this.props.currentUser}
                updateTopic={wrappedUpdateTopic}
                metacodeSets={this.props.metacodeSets}
                redrawCanvas={this.props.redrawCanvas}
              />
              <Title name={topic.get('name')}
                authorizedToEdit={authorizedToEdit}
                onChange={wrappedUpdateTopic}
              />
              <Desc desc={topic.get('desc')}
                authorizedToEdit={authorizedToEdit}
                onChange={wrappedUpdateTopic}
              />
              <Attachments topic={topic}
                authorizedToEdit={authorizedToEdit}
                updateTopic={wrappedUpdateTopic}
              />
              <Info topic={topic} />
              <div className='clearfloat' />
            </div>
          </div>
        </div>
      </Draggable>
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
