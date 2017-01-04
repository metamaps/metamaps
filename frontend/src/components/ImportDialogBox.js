import React, { PropTypes, Component } from 'react'
import Dropzone from 'react-dropzone'

class ImportDialogBox extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showImportInstructions: false
    }
  }

  handleExport = format => () => {
    window.open(`${window.location.pathname}/export.${format}`, '_blank')
  }

  handleFile = (files, e) => {
    // // for some reason it uploads twice, so we need this debouncer
    // // eslint-disable-next-line no-return-assign
    // this.debouncer = this.debouncer || window.setTimeout(() => this.debouncer = null, 10)
    // if (!this.debouncer) {
    //  this.props.onFileAdded(files[0])
    // }
    this.props.onFileAdded(files[0])
  }

  toggleShowInstructions = e => {
    this.setState({
      showImportInstructions: !this.state.showImportInstructions
    })
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
        <p>
          <a onClick={this.toggleShowInstructions} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            Show/hide import instructions
          </a>
        </p>
        {!this.state.showImportInstructions ? null : (<div>
          <p>
            You can import topics and synapses by uploading a spreadsheet here.
            The file should be in comma-separated format (when you save, change the
            filetype from .xls to .csv).
          </p>
          <img src={this.props.exampleImageUrl} style={{ width: '100%' }} />
          <p style={{ marginTop: '1em' }}>You can choose which columns to include in your data. Topics must have a name field. Synapses must have Topic 1 and Topic 2.</p>
          <p>&nbsp;</p>
          <p> * There are many valid import formats. Try exporting a map to see what columns you can include in your import data. You can also copy-paste from Excel to import, or import JSON.</p>
          <p> * If you are importing a list of links, you can use a Link column in place of the Name column.</p>
        </div>)}
      </div>
    )
  }
}

ImportDialogBox.propTypes = {
  onFileAdded: PropTypes.func,
  exampleImageUrl: PropTypes.string
}

export default ImportDialogBox
