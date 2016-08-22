import React, { Component, PropTypes } from 'react'
import Header from './Header.js'
import MapperCard from './MapperCard.js'
import MapCard from './MapCard.js'
import MapListItem from './MapListItem.js'

class Maps extends Component {
  render = () => {
    const { maps, currentUser, section, displayStyle, user, moreToLoad, loadMore } = this.props
    let mapElements

    if (displayStyle == 'grid') {
      mapElements = maps.models.map(function (map) {
        return <MapCard key={ map.id } map={ map } currentUser={ currentUser } />
      })
    }
    else if (displayStyle == 'list') {
      mapElements = maps.models.map(function (map) {
        return <MapListItem key={ map.id } map={ map } />
      })
    }

    return (
      <div>
        <div id='exploreMaps'>
          <div>
            { user ? <MapperCard user={ user } /> : null }
            { mapElements }
            <div className='clearfloat'></div>
            { moreToLoad ? 
                [<button className="button loadMore" onClick={ loadMore }>load more</button>, <div className='clearfloat'></div>]
                : null }
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
  displayStyle: PropTypes.string,
  user: PropTypes.object,
  currentUser: PropTypes.object,
  loadMore: PropTypes.func
}

export default Maps
