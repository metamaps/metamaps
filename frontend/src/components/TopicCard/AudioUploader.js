import React, { Component, PropTypes } from 'react'

import Recorder from 'react-recorder'

class AudioUploader extends Component {
  constructor(props) {
    super(props)

    this.state = {
      command: 'none'
    }
  }

  timeLimit30sTimeoutId = null

  enforce30sTimeLimit = cmd => {
    window.clearTimeout(this.timeLimit30sTimeoutId)
    if (cmd === 'start') {
      this.timeLimit30sTimeoutId = window.setTimeout(() => {
        this.command('stop')()
      }, 30000)
    }
  }

  command = cmd => () => {
    this.enforce30sTimeLimit(cmd)
    this.setState({ command: cmd })
  }

  onStop = blob => {
    const now = new Date()
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}:${now.getMinutes()}`
    const filename = `metamaps-recorded-audio-${date}.wav`
    const file = new window.File([blob], filename, { lastModifiedDate: now })

    this.props.uploadAttachment(file).then(success => {
      if (!success) {
        this.command('none')
      }
    })
  }

  handleRecordingError = () => {
    window.alert(`Audio recording failed. Some possible reasons include:
      not using an HTTPS connection,
      missing microphone,
      you haven't allowed your browser access to your microphone,
      or you need to reload the page.`)
  }

  render() {
    return (
      <div className="audio-uploader">
        <Recorder command={this.state.command}
          onStop={this.onStop}
          onError={this.handleRecordingError}
        />
        {this.state.command === 'start' && (
          <div className="upload-audio-recording">
            <div className="stop upload-audio-stop" onClick={this.command('stop')} />
            <div className="upload-audio-recording-text">&nbsp;&nbsp;Recording...</div>
          </div>
        )}
        {this.state.command === 'none' && (
          <div className="start upload-audio-start" onClick={this.command('start')}>
            Click to record <br />
            (max 30 seconds)
          </div>
        )}
        <div className="attachment-cancel" onClick={this.props.cancel} />
      </div>
    )
  }
}

AudioUploader.propTypes = {
  uploadAttachment: PropTypes.func,
  cancel: PropTypes.func
}

export default AudioUploader
