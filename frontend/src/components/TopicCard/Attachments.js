import React, { Component } from 'react'
import PropTypes from 'prop-types'

import EmbedlyLink from './EmbedlyLink'

class Attachments extends Component {
  render = () => {
    const { topic, authorizedToEdit, updateTopic } = this.props
    const link = topic.get('link')

    return (
      <div className="attachments">
        <EmbedlyLink topicId={topic.id}
          link={link}
          authorizedToEdit={authorizedToEdit}
          updateTopic={updateTopic}
        />
      </div>
    )
  }
}

Attachments.propTypes = {
  topic: PropTypes.object, // Backbone object
  authorizedToEdit: PropTypes.bool,
  updateTopic: PropTypes.func
}

export default Attachments
