import React, { Component } from 'react'

class Tutorial extends Component {
  render = () => {
    return (
      <div className="lightboxContent" id="tutorial">
        <h3>Tutorial</h3>
        <iframe src="//player.vimeo.com/video/88334167?title=0&amp;byline=0&amp;portrait=0" width="510" height="319" frameBorder="0" allowFullScreen></iframe>
      </div>
    )
  }
}

export default Tutorial