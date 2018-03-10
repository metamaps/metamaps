import React, { Component } from 'react'

class RequestAccess extends Component {
  constructor(props) {
    super(props)
    this.state = {
      requestPending: false,
      requestSent: false,
      error: false
    }
  }

  requestAccess = async () => {
    if (this.state.requestSent || this.state.requestPending || this.state.error) {
      return
    }
    this.setState({ requestPending: true })
    const success = this.props.requestAccess(this.props.params.id)
    if (success) {
      this.setState({
        requestPending: false,
        requestSent: true
      })
    } else {
      this.setState({
        requestPending: false,
        error: true
      })
    }
  }
  render = () => {
    const { requestPending, requestSent, error } = this.state
    return (
      <div id="yield">
        <div className='request_access'>
          <div className='monkey'></div>
          <div className='explainer_text'>
            Hmmm. This map is private, but you can request to edit it from the map creator.
          </div>
          <div className='make_request' onClick={this.requestAccess}>
            {!requestPending && !requestSent && !error && 'REQUEST ACCESS'}
            {requestSent && 'Request Sent'}
            {requestPending && 'requesting...'}
            {error && 'There was an error'}
          </div>
        </div>
      </div>
    )
  }
}

export default RequestAccess