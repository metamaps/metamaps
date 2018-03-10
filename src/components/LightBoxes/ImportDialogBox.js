import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'

class ImportDialogBox extends Component {
  handleFile = (files, e) => {
    e.preventDefault() // prevent it from triggering the default drag-drop handler
    this.props.onFileAdded(files[0])
  }

  render = () => {
    return (
      <div className="lightboxContent" id="import-dialog">
        <div className="importDialogWrapper">
          <div className="import-dialog">
            <h3>EXPORT</h3>
            <div className="export-csv import-blue-button" onClick={this.props.onExport('csv')}>
              Export as CSV
            </div>
            <div className="export-json import-blue-button" onClick={this.props.onExport('json')}>
              Export as JSON
            </div>
            <div className="download-screenshot import-blue-button" onClick={this.props.downloadScreenshot}>
              Download screenshot
            </div>
            <h3>IMPORT</h3>
            <p>To upload a file, drop it here:</p>
            <Dropzone onDropAccepted={this.handleFile}
              className="fileupload">
              Drop files here!
            </Dropzone>
            <p>See <a href="https://docs.metamaps.cc/importing_and_exporting_data.html">docs.metamaps.cc</a> for instructions.</p>
          </div>
        </div>
      </div>
    )
  }
}

ImportDialogBox.propTypes = {
  onFileAdded: PropTypes.func,
  downloadScreenshot: PropTypes.func,
  onExport: PropTypes.func
}

export default ImportDialogBox
