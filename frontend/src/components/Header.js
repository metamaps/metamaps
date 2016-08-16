import React, { Component, PropTypes } from 'react'
import { objectWithoutProperties } from '../utils'

const MapLink = props => {
  const { show, text, href, linkClass } = props
  const otherProps = objectWithoutProperties(props, ['show', 'text', 'href', 'linkClass'])
  if (!show) {
    return null
  }

  return (
    <a { ...otherProps } href={href} className={linkClass}>
      <div className="exploreMapsIcon"></div>
      {text}
    </a>
  )
}

class Header extends Component {
  render = () => {
    const { signedIn, section } = this.props

    const activeClass = (title) => {
      let forClass = "exploreMapsButton"
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
            <MapLink show={signedIn && explore}
              href="/explore/mine"
              linkClass={activeClass("my")}
              data-router="true"
              text="My Maps"
            />
            <MapLink show={signedIn && explore}
              href="/explore/shared"
              linkClass={activeClass("shared")}
              data-router="true"
              text="Shared With Me"
            />
            <MapLink show={explore}
              href={signedIn ? "/" : "/explore/active"}
              linkClass={activeClass("active")}
              data-router="true"
              text="Recently Active"
            />
            <MapLink show={!signedIn && explore}
              href="/explore/featured"
              linkClass={activeClass("featured")}
              data-router="true"
              text="Featured Maps"
            />
      
            {mapper ? (
              <div className='exploreMapsButton active mapperButton'>
                <img className='exploreMapperImage' width='24' height='24' src={this.props.userAvatar} />
                <div className='exploreMapperName'>{this.props.userName}&rsquo;s Maps</div>
                <div className='clearfloat'></div>
              </div>
            ) : null }
      
            <MapLink show={apps}
              href="/oauth/applications"
              linkClass={"activeMaps exploreMapsButton"  + (section == "registered" ? " active" : "")}
              text="Registered Apps"
            />
            <MapLink show={apps}
              href="/oauth/applications"
              linkClass={"activeMaps exploreMapsButton"  + (section == "authorized" ? " active" : "")}
              text="Authorized Apps"
            />
          </div>
        </div>
      </div>
    )
  }
}

Header.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  section: PropTypes.string.isRequired,
  userAvatar: PropTypes.string,
  userName: PropTypes.string
}

export default Header
