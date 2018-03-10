import React, { Component } from 'react'
import clipboard from 'clipboard-js'

class Invite extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copied: false,
      unable: false
    }
  }

  inviteLink = () => {
    const { host, protocol } = window ? window.location : {}
    const inviteLink = `${protocol}//${host}/join?code=${this.props.inviteCode}`
    return inviteLink
  }

  shareInvite = () => {
    const inviteLink = this.inviteLink()
    clipboard.copy({
      'text/plain': inviteLink
    }).then(() => {
      this.setState({ copied: true })
      window.setTimeout(() => this.setState({ copied: false }), 1500)
    }, () => {
      this.setState({ unable: true })
      window.setTimeout(() => this.setState({ unable: false }), 1500)
    })
  }

  render = () => {
    const inviteLink = this.inviteLink()
    return (
      <div className="lightboxContent" id="invite">
        <h3>SHARE INVITE</h3>
        <div className="leaveSpace"></div>
        <p>The Metamaps platform is currently in an invite-only beta with the express purpose of creating a high value knowledge ecosystem, a diverse community of contributors and a culture of collaboration and curiosity.</p>
        <p>As a valued beta tester, you have the ability to invite your peers, colleagues and collaborators onto the platform.</p>
        <p>Below is a personal invite link containing your unique access code, which can be used multiple times.</p>
        <div id="joinCodesBox">
          <p className="joinCodes">
            {inviteLink}
            <button className="button" onClick={this.shareInvite}>COPY INVITE LINK!</button>
          </p>
          <p className="popup" style={{textAlign: 'center'}}>
            {this.state.copied && 'Copied!'}
            {this.state.unable && "Your browser doesn't support copying, please copy manually."}
          </p>
        </div>
      </div>
    )
  }
}

export default Invite