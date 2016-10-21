import React, { Component, PropTypes } from 'react'
import Header from './Header'
import MapperCard from './MapperCard'
import MapCard from './MapCard'

const MAP_WIDTH = 252
const MAX_COLUMNS = 4

class Maps extends Component {

  constructor(props) {
    super(props)
    this.state = { mapsWidth: 0 }
  }

  componentDidMount() {
    window && window.addEventListener('resize', this.resize)
    this.resize()
  }

  componentDidUpdate(oldProps) {
    const { maps, user, currentUser } = this.props
    const oldMaps = oldProps.maps
    const oldUser = oldProps.user
    const oldCurrentUser = oldProps.currentUser
    const numCards = maps.length + (user || currentUser ? 1 : 0)
    const oldNumCards = oldMaps.length + (oldUser || oldCurrentUser ? 1 : 0)
    if (numCards !== oldNumCards) this.resize()
  }

  componentWillUnmount() {
    window && window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    const { maps, user, currentUser } = this.props
    const numCards = maps.length + (user || currentUser ? 1 : 0)
    const mapSpaces = Math.floor(document.body.clientWidth / MAP_WIDTH)
    const mapsWidth = Math.min(MAX_COLUMNS, Math.min(numCards, mapSpaces)) * MAP_WIDTH
    this.setState({ mapsWidth })
  }

  render = () => {
    const { maps, currentUser, juntoState, section, user, moreToLoad, loadMore, onStar, onRequest } = this.props
    const style = { width: this.state.mapsWidth + 'px' }

    return (
      <div>
        <div id='exploreMaps'>
          <div style={ style }>
            { user ? <MapperCard user={ user } /> : null }
            { currentUser && !user ? <div className="map newMap"><a href="/maps/new"><div className="newMapImage"></div><span>Create new map...</span></a></div> : null }
            { maps.models.map(map => <MapCard key={ map.id } map={ map } juntoState={ juntoState } currentUser={ currentUser } onStar={ onStar } onRequest={ onRequest } />) }
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
  juntoState: PropTypes.object.isRequired,
  moreToLoad: PropTypes.bool.isRequired,
  user: PropTypes.object,
  currentUser: PropTypes.object,
  loadMore: PropTypes.func,
  onStar: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired
}

export default Maps
