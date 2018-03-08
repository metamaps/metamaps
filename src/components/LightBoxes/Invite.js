import React, { Component } from 'react'

class Invite extends Component {
  render = () => {
    return (
      <div className="lightboxContent" id="invite">
        <h3>SHARE INVITE</h3>
        <div className="leaveSpace"></div>
        <p>The Metamaps platform is currently in an invite-only beta with the express purpose of creating a high value knowledge ecosystem, a diverse community of contributors and a culture of collaboration and curiosity.</p>
        <p>As a valued beta tester, you have the ability to invite your peers, colleagues and collaborators onto the platform.</p>
        <p>Below is a personal invite link containing your unique access code, which can be used multiple times.</p>
        <div id="joinCodesBox">
          <p className="joinCodes">
            {`/join?code=${this.props.inviteCode}`}
            <button className="button" onClick={() => Metamaps.GlobalUI.shareInvite(this.props.inviteCode)}>COPY INVITE LINK!</button>
          </p>
        </div>
      </div>
    )
  }
}

export default Invite