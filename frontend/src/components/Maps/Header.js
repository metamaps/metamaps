import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import _ from 'lodash'

const MapLink = props => {
  const { show, text, href, linkClass } = props
  const otherProps = _.omit(props, ['show', 'text', 'href', 'linkClass'])
  if (!show) {
    return null
  }

  return (
    <Link { ...otherProps } to={href} className={linkClass}>
      <div className="exploreMapsIcon"></div>
      {text}
    </Link>
  )
}

class Header extends Component {
  render = () => {
    const { signedIn, section, user } = this.props

    const activeClass = (title) => {
      let forClass = 'exploreMapsButton'
      forClass += ' ' + title + 'Maps'
      if (title === 'my' && section === 'mine' ||
          title === section) forClass += ' active'
      return forClass
    }

    const explore = section === 'mine' || section === 'active' || section === 'starred' || section === 'shared' || section === 'featured'
    const mapper = section === 'mapper'

    return (
      <div id="exploreMapsHeader">
        <div className="exploreMapsBar exploreElement">
          <div className="exploreMapsMenu">
            <div className="exploreMapsCenter">
              <MapLink show={explore}
                href={signedIn ? '/' : '/explore/active'}
                linkClass={activeClass('active')}
                text="All Maps"
              />
              <MapLink show={signedIn && explore}
                href="/explore/mine"
                linkClass={activeClass('my')}
                text="My Maps"
              />
              <MapLink show={signedIn && explore}
                href="/explore/shared"
                linkClass={activeClass('shared')}
                text="Shared With Me"
              />
              <MapLink show={signedIn && explore}
                href="/explore/starred"
                linkClass={activeClass('starred')}
                text="Starred By Me"
              />
              <MapLink show={!signedIn && explore}
                href="/explore/featured"
                linkClass={activeClass('featured')}
                text="Featured Maps"
              />

              {mapper ? (
                <div className='exploreMapsButton active mapperButton'>
                  {user && <img className='exploreMapperImage' width='24' height='24' src={user.image} />}
                  {user && <div className='exploreMapperName'>{user.name}&rsquo;s Maps</div>}
                  <div className='clearfloat'></div>
                </div>
              ) : null }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Header.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  section: PropTypes.string.isRequired,
  user: PropTypes.object
}

export default Header
