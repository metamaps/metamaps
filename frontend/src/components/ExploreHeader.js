import React, { Component, PropTypes } from 'react'

class ExploreHeader extends Component {
  render = () => {
    const signedIn = this.props.signedIn
    return (
      <div className="exploreMapsBar exploreElement">
        <div className="exploreMapsMenu">
          <div className="exploreMapsCenter">
            {signedIn ? <a href="/explore/mine" className="myMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              My Maps
            </a> : null }
            {signedIn ? <a href="/explore/shared" className="sharedMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              Shared With Me
            </a> : null }
            <a href={signedIn ? "/" : "/explore/active"}  className="activeMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              Recently Active
            </a>
            {!signedIn ? <a href="/explore/featured" className="featuredMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              Featured Maps
            </a> : null }
          </div>
        </div>
      </div>
    )
  }
}

export default ExploreHeader
