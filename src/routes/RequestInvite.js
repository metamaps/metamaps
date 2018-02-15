import React, { Component } from 'react'

class RequestAccess extends Component {
  render = () => {
    return (
      <div>
        <div className="requestInviteHeader"></div>
        <iframe className="requestInvite" src="https://docs.google.com/forms/d/1lWoKPFHErsDfV5l7-SvcHxwX3vDi9nNNVW0rFMgJwgg/viewform?embedded=true" width="700" frameBorder="0" marginHeight="0" marginWidth="0">Loading...</iframe>
      </div>
    )
  }
}

export default RequestAccess
