import React, { Component, PropTypes } from 'react'
import Dropzone from 'react-dropzone'

class FileUploader extends Component {
  handleFileUpload = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length >= 1) {
      this.props.uploadAttachment(acceptedFiles[0])
    } else {
      window.alert('File upload failed, please try again.')
    }
  }

  render() {
    return (
      <div className="upload-file">
        <Dropzone className="upload-file-dropzone"
          onDrop={this.handleFileUpload}
        >
          Drag file here <br />
          (maximum 5mb)
        </Dropzone>
        <div className="attachment-cancel" onClick={this.props.cancel} />
      </div>
    )
  }
}

FileUploader.propTypes = {
  updateTopic: PropTypes.func,
  uploadAttachment: PropTypes.func,
  cancel: PropTypes.func
}

export default FileUploader
