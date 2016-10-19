import React, { Component, PropTypes } from 'react'
import Header from './Header'
import MapperCard from './MapperCard'
import MapCard from './MapCard'

const MAP_WIDTH = 252

class Maps extends Component {

  constructor(props) {
    super(props)
    this.state = { mapsWidth: 0 }
  }

  componentDidMount() {
    window && window.addEventListener('resize', this.resize)
    this.resize()
  }

  componentWillUnmount() {
    window && window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    const mapSpaces = Math.floor(document.body.clientWidth / MAP_WIDTH)
    this.setState({ mapsWidth: mapSpaces * MAP_WIDTH })
  }

  render = () => {
    const { maps, currentUser, section, user, moreToLoad, loadMore } = this.props
    const style = { width: this.state.mapsWidth + 'px' }

    return (
      <div>
        <div id='exploreMaps'>
          <div style={ style }>
            { user ? <MapperCard user={ user } /> : null }
            { currentUser && !user ? <div className="map newMap"><a href="/maps/new"><div className="newMapImage"></div><span>Create new map...</span></a></div> : null }
            { maps.models.map(map => <MapCard key={ map.id } map={ map } currentUser={ currentUser } />) }
            <div className='clearfloat'></div>
            {!moreToLoad ? null : [
              <button className="button loadMore" onClick={ loadMore }>load more</button>,
              <div className='clearfloat'></div>
            ]}
          </div>
        </div>
        <Header signedIn={ !!currentUser }
          section={ section }
          user={ user }
          />
      </div>
    )
  }
}

Maps.propTypes = {
  section: PropTypes.string.isRequired,
  maps: PropTypes.object.isRequired,
  moreToLoad: PropTypes.bool.isRequired,
  user: PropTypes.object,
  currentUser: PropTypes.object,
  loadMore: PropTypes.func
}

export default Maps
