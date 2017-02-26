import React, { PropTypes, Component } from 'react'

import Title from './Title'
import Links from './Links'
import Desc from './Desc'
import Attachments from './Attachments'

class ReactTopicCard extends Component {
  render = () => {
    const { topic, ActiveMapper } = this.props
    const authorizedToEdit = topic.authorizeToEdit(ActiveMapper)
    const hasAttachment = topic.get('link') && topic.get('link') !== ''

    let classname = 'permission'
    if (authorizedToEdit) {
      classname += ' canEdit'
    } else {
      classname += ' cannotEdit'
    }
    if (topic.authorizePermissionChange(ActiveMapper)) classname += ' yourTopic'

    return (
      <div className={classname}>
        <div className={`CardOnGraph ${hasAttachment ? 'hasAttachment' : ''}`} id={`topic_${topic.id}`}>
          <Title name={topic.get('name')}
            authorizedToEdit={authorizedToEdit}
            onChange={this.props.updateTopic}
          />
          <Links topic={topic}
            ActiveMapper={this.props.ActiveMapper}
            updateTopic={this.props.updateTopic}
            metacodeSets={this.props.metacodeSets}
            redrawCanvas={this.props.redrawCanvas}
          />
          <Desc desc={topic.get('desc')}
            authorizedToEdit={authorizedToEdit}
            onChange={this.props.updateTopic}
          />
          <Attachments topic={topic}
            authorizedToEdit={authorizedToEdit}
            updateTopic={this.props.updateTopic}
          />
          <div className="clearfloat"></div>
        </div>
      </div>
    )
  }
}

ReactTopicCard.propTypes = {
  topic: PropTypes.object,
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func,
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
