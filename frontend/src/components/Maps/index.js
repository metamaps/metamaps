import React, { Component, PropTypes } from 'react'
import { throttle } from 'lodash'
import Header from './Header'
import MapperCard from './MapperCard'
import MapCard from './MapCard'

// 220 wide + 16 padding on both sides
const MAP_WIDTH = 252
const MOBILE_VIEW_BREAKPOINT = 504
const MOBILE_VIEW_PADDING = 40
const MAX_COLUMNS = 4

class Maps extends Component {

  constructor(props) {
    super(props)
    this.state = { mapsWidth: 0 }
  }

  componentDidMount() {
    window && window.addEventListener('resize', this.resize)
    this.refs.maps.addEventListener('scroll', throttle(this.scroll, 500, { leading: true, trailing: false }))
    this.resize()
  }

  componentWillUnmount() {
    window && window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    const { maps, user, currentUser } = this.props
    const numCards = maps.length + (user || currentUser ? 1 : 0)
    const mapSpaces = Math.floor(document.body.clientWidth / MAP_WIDTH)
    const mapsWidth = document.body.clientWidth <= MOBILE_VIEW_BREAKPOINT
                        ? document.body.clientWidth - MOBILE_VIEW_PADDING
                        : Math.min(MAX_COLUMNS, Math.min(numCards, mapSpaces)) * MAP_WIDTH
    this.setState({ mapsWidth })
  }

  scroll = () => {
    const { loadMore, moreToLoad, pending } = this.props
    const { maps } = this.refs
    if (moreToLoad && !pending && maps.scrollTop + maps.offsetHeight > maps.scrollHeight - 300) {
      loadMore()
    }
  }

  render = () => {
    const { maps, currentUser, juntoState, pending, section, user, onStar, onRequest, onFollow } = this.props
    const style = { width: this.state.mapsWidth + 'px' }
    const mobile = document && document.body.clientWidth <= MOBILE_VIEW_BREAKPOINT

    return (
      <div>
        <div id='exploreMaps' ref='maps'>
          <div style={ style }>
            { user ? <MapperCard user={ user } /> : null }
            { currentUser && !user && !(pending && maps.length === 0) ? <div className="map newMap"><a href="/maps/new"><div className="newMapImage"></div><span>Create new map...</span></a></div> : null }
            { maps.models.map(map => <MapCard key={ map.id } map={ map } mobile={ mobile } juntoState={ juntoState } currentUser={ currentUser } onStar={ onStar } onRequest={ onRequest } onFollow={ onFollow } />) }
            <div className='clearfloat'></div>
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
  pending: PropTypes.bool.isRequired,
  onStar: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired,
  onFollow: PropTypes.func.isRequired
}

export default Maps
