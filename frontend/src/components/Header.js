import React, { Component, PropTypes } from 'react'

class Header extends Component {
  render = () => {
    const signedIn = this.props.signedIn
    const section = this.props.section
    var activeClass = (title) => {
      var forClass = "exploreMapsButton"
      forClass += " " + title + "Maps"
      if (title == "my" && section == "mine" ||
          title == section) forClass += " active"
      return forClass
    }

    const explore = section == "mine" || section == "active" || section == "shared" || section == "featured"
    const mapper = section == "mapper"
    const apps = section == "registered" || section == "authorized"

    return (
      <div className="exploreMapsBar exploreElement">
        <div className="exploreMapsMenu">
          <div className="exploreMapsCenter">
            {signedIn && explore ? <a href="/explore/mine" className={activeClass("my")}>
              <div className="exploreMapsIcon"></div>
              My Maps
            </a> : null }
            {signedIn && explore ? <a href="/explore/shared" className={activeClass("shared")}>
              <div className="exploreMapsIcon"></div>
              Shared With Me
            </a> : null }
            {explore ? <a href={signedIn ? "/" : "/explore/active"}  className={activeClass("active")}>
              <div className="exploreMapsIcon"></div>
              Recently Active
            </a> : null }
            {!signedIn && explore ? <a href="/explore/featured" className={activeClass("featured")}>
              <div className="exploreMapsIcon"></div>
              Featured Maps
            </a> : null }
            {mapper ? <div className='exploreMapsButton active mapperButton'>
                <img className='exploreMapperImage' width='24' height='24' src={this.props.userAvatar} />
                <div className='exploreMapperName'>{this.props.userName}&rsquo;s Maps</div>
                <div className='clearfloat'></div>
              </div> : null }
            {apps ? <a href="/oauth/applications" className={"activeMaps exploreMapsButton"  + (section == "registered" ? " active" : "")} data-bypass="true">
              <div className="exploreMapsIcon"></div>
              Registered Apps
            </a> : null }
            {apps ? <a href="/oauth/authorized_applications" className={"featuredMaps exploreMapsButton" + (section == "authorized" ? " active" : "")} data-bypass="true">
              <div className="exploreMapsIcon"></div>
              Authorized Apps
            </a> : null }
          </div>
        </div>
      </div>
    )
  }
}

export default Header
