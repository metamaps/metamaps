import React, { PropTypes, Component } from 'react'

import EmbedlyLink from './EmbedlyLink'

class Attachments extends Component {
  render = () => {
    const { topic, authorizedToEdit, updateTopic } = this.props
    const link = topic.get('link')

    return (
      <div className="attachments">
        <EmbedlyLink link={link} authorizedToEdit={authorizedToEdit} updateTopic={updateTopic} />
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
