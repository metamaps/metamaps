import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NavBar from '../../components/NavBar'
import NavBarLink from '../../components/NavBarLink'

class Header extends Component {
  render = () => {
    const { signedIn, section, user } = this.props

    const explore = section === 'mine' || section === 'active' || section === 'starred' || section === 'shared' || section === 'featured'
    const mapper = section === 'mapper'

    return (
      <NavBar>
        <NavBarLink show={explore}
          href={signedIn ? '/' : '/explore/active'}
          linkClass="activeMaps"
          text="All Maps"
          />
        <NavBarLink show={signedIn && explore}
          href="/explore/mine"
          linkClass="myMaps"
          text="My Maps"
          />
        <NavBarLink show={signedIn && explore}
          href="/explore/shared"
          linkClass="sharedMaps"
          text="Shared With Me"
          />
        <NavBarLink show={signedIn && explore}
          href="/explore/starred"
          linkClass="starredMaps"
          text="Starred By Me"
          />
        <NavBarLink show={!signedIn && explore}
          href="/explore/featured"
          linkClass="featuredMaps"
          text="Featured Maps"
          />
        {mapper ? (
          <div className='navBarButton active mapperButton'>
            {user && <img className='exploreMapperImage' width='24' height='24' src={user.image} />}
            {user && <div className='exploreMapperName'>{user.name}&rsquo;s Maps</div>}
            <div className='clearfloat'></div>
          </div>
        ) : null }
      </NavBar>
    )
  }
}

Header.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  section: PropTypes.string.isRequired,
  user: PropTypes.object
}

export default Header
