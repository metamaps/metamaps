import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MapInfoBox from '../MapView/MapInfoBox'

class InfoAndHelp extends Component {
  static propTypes = {
    mapIsStarred: PropTypes.bool,
    currentUser: PropTypes.object,
    map: PropTypes.object,
    onHelpClick: PropTypes.func,
    onMapStar: PropTypes.func,
    onMapUnstar: PropTypes.func,
    onInfoClick: PropTypes.func,
    infoBoxhtml: PropTypes.string
  }

  render () {
    const { mapIsStarred, map, currentUser, onInfoClick, infoBoxHtml, onMapStar, onMapUnstar, onHelpClick } = this.props
    const starclassName = mapIsStarred ? 'starred' : ''
    const tooltip = mapIsStarred ? 'Unstar' : 'Star'
    const onStarClick = mapIsStarred ? onMapUnstar : onMapStar
    return <div className="infoAndHelp">
      {map && <MapInfoBox map={map} currentUser={currentUser} infoBoxHtml={infoBoxHtml} />}
      {map && currentUser && <div className={`starMap infoElement mapElement ${starclassName}`} onClick={onStarClick}>
        <div className="tooltipsAbove">{tooltip}</div>
      </div>}
      {map && <div className="mapInfoIcon infoElement mapElement" onClick={onInfoClick}>
        <div className="tooltipsAbove">Map Info</div>
      </div>}
      <div className="openCheatsheet infoElement mapElement" onClick={onHelpClick}>
        <div className="tooltipsAbove">Help</div>
      </div>
      <div className="clearfloat"></div>
    </div>
  }
}

export default InfoAndHelp
