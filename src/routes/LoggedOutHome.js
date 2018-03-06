import React, { Component } from 'react'
import { Link } from 'react-router'

class LoggedOutHome extends Component {
  render = () => {
    return (
        <div id="yield">
        <div className="homeWrapper homeText">
          <div className="homeTitle">Make Sense with Metamaps</div>
          <div className="homeIntro">
          <span className="green din-medium">METAMAPS.CC</span> is a free and open source platform that supports real-time sense-making, distributed collaboration, and the creative intelligence of individuals, organizations and communities. We are currently in an <span className="din-medium">invite-only beta.</span>
          </div>
        </div>
        <div className="fullWidthWrapper withVideo">
          <div className="homeWrapper">
            <iframe className="homeVideo" src="https://player.vimeo.com/video/113154814" width="560" height="315" frameBorder="0" allowFullScreen></iframe>
            <div className="callToAction">
              <h3>Who finds it useful?</h3>
              <p>Designers, inventors, artists, educators, strategists, consultants, facilitators, entrepreneurs, systems thinkers, changemakers, analysts, students, researchers... maybe you!</p>
              <button type="button" className="button learnMoreCTA" onClick={() => {Metamaps.GlobalUI.openLightbox('about')}}>LEARN MORE</button>
              <Link to="/explore/featured" data-router="true" className="exploreFeaturedCTA">EXPLORE FEATURED MAPS</Link>
              <Link to="/request" className="requestInviteCTA">REQUEST INVITE</Link>
            </div>
            <div className="clearfloat"></div>
          </div>
        </div>
        <div className="fullWidthWrapper withPartners">
          <div className="homeWrapper homePartners">
          </div>
        </div>
      </div>
    )
  }
}

export default LoggedOutHome
