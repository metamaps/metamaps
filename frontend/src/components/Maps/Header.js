import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NavBar from '../App/Navbar'
import NavBarLink from '../App/NavBarLink'

class Header extends Component {
  render = () => {
    const { signedIn, section, user } = this.props

    const activeClass = (title) => {
      let forClass = title + 'Maps'
      if (title === 'my' && section === 'mine' ||
          title === section) forClass += ' active'
      return forClass
    }

    const explore = section === 'mine' || section === 'active' || section === 'starred' || section === 'shared' || section === 'featured'
    const mapper = section === 'mapper'

    return (
      <NavBar>
				<NavBarLink show={explore}
					href={signedIn ? '/' : '/explore/active'}
					linkClass={activeClass('active')}
					text="All Maps"
				/>
				<NavBarLink show={signedIn && explore}
					href="/explore/mine"
					linkClass={activeClass('my')}
					text="My Maps"
				/>
				<NavBarLink show={signedIn && explore}
					href="/explore/shared"
					linkClass={activeClass('shared')}
					text="Shared With Me"
				/>
				<NavBarLink show={signedIn && explore}
					href="/explore/starred"
					linkClass={activeClass('starred')}
					text="Starred By Me"
				/>
				<NavBarLink show={!signedIn && explore}
					href="/explore/featured"
					linkClass={activeClass('featured')}
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
