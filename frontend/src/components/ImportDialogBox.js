import React, { PropTypes, Component } from 'react'
import Dropzone from 'react-dropzone'

class ImportDialogBox extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  handleExport = format => () => {
    window.open(`${window.location.pathname}/export.${format}`, '_blank')
  }

  handleFile = (files, e) => {
    this.props.onFileAdded(files[0])
  }

  render = () => {
    return (
      <div className="import-dialog">
        <h3>EXPORT</h3>
        <div className="import-blue-button" onClick={this.handleExport('csv')}>
          Export as CSV
        </div>
        <div className="import-blue-button" onClick={this.handleExport('json')}>
          Export as JSON
        </div>
        <h3>IMPORT</h3>
        <p>To upload a file, drop it here:</p>
        <Dropzone onDropAccepted={this.handleFile}
          className="fileupload"
        >
          Drop files here!
        </Dropzone>
        <p>See <a href="https://docs.metamaps.cc/importing_and_exporting_data.html">docs.metamaps.cc</a> for instructions.</p>
      </div>
    )
  }
}

ImportDialogBox.propTypes = {
  onFileAdded: PropTypes.func,
  exampleImageUrl: PropTypes.string
}

export default ImportDialogBox
