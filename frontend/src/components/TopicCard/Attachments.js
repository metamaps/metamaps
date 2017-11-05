import React, { Component } from 'react'
import PropTypes from 'prop-types'

import EmbedlyLinkChooser from './EmbedlyLinkChooser'
import EmbedlyCard from './EmbedlyCard'
import FileUploader from './FileUploader'
import PhotoUploader from './PhotoUploader'
import AudioUploader from './AudioUploader'
import FileAttachment from './FileAttachment'

class Attachments extends Component {
  constructor(props) {
    super(props)

    this.state = this.defaultState
  }

  defaultState = {
    addingPhoto: false,
    addingLink: false,
    addingAudio: false,
    addingFile: false
  }

  clearState = () => {
    this.setState(this.defaultState)
  }

  // onClick handler for the 4 buttons, which triggers showing the proper uploader
  choose = key => () => {
    this.setState(Object.assign({}, this.defaultState, { [key]: true }))
  }

  render = () => {
    const { topic, authorizedToEdit, updateTopic } = this.props
    const link = topic.get('link')
    const attachments = topic.get('attachments')
    const file = attachments && attachments.length ? attachments[0] : null

    let childComponent
    if (link) {
      childComponent = (
        <EmbedlyCard link={link}
          authorizedToEdit={authorizedToEdit}
          removeLink={this.clearState}
        />
      )
    } else if (file) {
      childComponent = (
        <FileAttachment file={file}
          authorizedToEdit={authorizedToEdit}
          removeAttachment={this.props.removeAttachment}
          fileTypeIcons={this.props.fileTypeIcons}
        />
      )
    } else if (!authorizedToEdit) {
      childComponent = null
    } else if (this.state.addingPhoto) {
      childComponent = (
        <PhotoUploader updateTopic={updateTopic}
          uploadAttachment={this.props.uploadAttachment}
          cancel={this.clearState}
        />
      )
    } else if (this.state.addingLink) {
      childComponent = (
        <EmbedlyLinkChooser updateTopic={updateTopic}
          cancel={this.clearState}
        />
      )
    } else if (this.state.addingAudio) {
      childComponent = (
        <AudioUploader updateTopic={updateTopic}
          uploadAttachment={this.props.uploadAttachment}
          cancel={this.clearState}
        />
      )
    } else if (this.state.addingFile) {
      childComponent = (
        <FileUploader updateTopic={updateTopic}
          uploadAttachment={this.props.uploadAttachment}
          cancel={this.clearState}
        />
      )
    } else {
      childComponent = (
        <div className="attachment-type-chooser">
          <div className="photo-upload"><div onClick={this.choose('addingPhoto')}>Photo</div></div>
            <div className="link-upload"><div onClick={this.choose('addingLink')}>Link</div></div>
              <div className="audio-upload"><div onClick={this.choose('addingAudio')}>Audio</div></div>
                <div className="file-upload"><div onClick={this.choose('addingFile')}>Upload</div></div>
        </div>
      )
    }

    return (
      <div className="attachments">
        {childComponent}
      </div>
    )
  }
}

Attachments.propTypes = {
  topic: PropTypes.object, // Backbone object
  authorizedToEdit: PropTypes.bool,
  updateTopic: PropTypes.func,
  uploadAttachment: PropTypes.func,
  removeAttachment: PropTypes.func,
  fileTypeIcons: PropTypes.objectOf(PropTypes.string)
}

export default Attachments
