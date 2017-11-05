import React, { Component, PropTypes } from 'react'

class FileAttachment extends Component {
  getFileType = contentType => {
    if (contentType === 'text/plain') {
      return 'text'
    } else if (contentType === 'application/pdf') {
      return 'pdf'
    } else if (contentType.match(/^image\//)) {
      return 'image'
    } else if (contentType.match(/^audio\//) ||
               contentType === 'video/ogg' ||
               contentType === 'video/webm') {
      return 'audio'
    } else {
      return 'unknown'
    }
  }

  getFileIcon = file => {
    const type = this.getFileType(file.content_type)

    if (this.props.fileTypeIcons[type]) {
      return this.props.fileTypeIcons[type]
    } else {
      return this.props.fileTypeIcons.unknown
    }
  }

  render() {
    const { file } = this.props
    return (
      <div className={`file ${this.getFileType(file.content_type)}-file-type`}
        style={{ clear: 'both' }}
      >
        <a href={file.url} target="_blank">
          <img src={this.getFileIcon(file)} className="filetype-icon" />
          {file.file_name}
        </a>
        <div className="attachment-cancel" onClick={this.props.removeAttachment} />
      </div>
    )
  }
}

FileAttachment.propTypes = {
  file: PropTypes.shape({
    content_type: PropTypes.string,
    file_name: PropTypes.string,
    url: PropTypes.string
  }),
  authorizedToEdit: PropTypes.bool,
  removeAttachment: PropTypes.func,
  fileTypeIcons: PropTypes.objectOf(PropTypes.string)
}

export default FileAttachment
