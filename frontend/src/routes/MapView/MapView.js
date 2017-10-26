import React, { Component } from 'react'
import PropTypes from 'prop-types'

import UpperOptions from '../../containers/UpperOptions'
import InfoAndHelp from '../../containers/InfoAndHelp'
import VisualizationControls from '../../containers/VisualizationControls'
import ContextMenu from '../../containers/ContextMenu'
import TopicCard from '../../containers/TopicCard'

import Instructions from '../../components/Instructions'
import MapChat from '../../components/MapChat'
import MapVis from '../../components/MapVis'

export default class MapView extends Component {

  static propTypes = {
    contextMenu: PropTypes.bool,
    mobile: PropTypes.bool,
    mapId: PropTypes.string,
    map: PropTypes.object,
    mapIsStarred: PropTypes.bool,
    onMapStar: PropTypes.func,
    onMapUnstar: PropTypes.func,
    filterData: PropTypes.object,
    allForFiltering: PropTypes.object,
    visibleForFiltering: PropTypes.object,
    toggleMetacode: PropTypes.func,
    toggleMapper: PropTypes.func,
    toggleSynapse: PropTypes.func,
    filterAllMetacodes: PropTypes.func,
    filterAllMappers: PropTypes.func,
    filterAllSynapses: PropTypes.func,
    toggleMapInfoBox: PropTypes.func,
    infoBoxHtml: PropTypes.string,
    currentUser: PropTypes.object,
    endActiveMap: PropTypes.func,
    launchNewMap: PropTypes.func,
    openImportLightbox: PropTypes.func,
    forkMap: PropTypes.func,
    openHelpLightbox: PropTypes.func,
    onZoomExtents: PropTypes.func,
    onZoomIn: PropTypes.func,
    onZoomOut: PropTypes.func,
    hasLearnedTopicCreation: PropTypes.bool,
    chatIsOpen: PropTypes.bool,
    closeChat: PropTypes.func,
    openChat: PropTypes.func
  }

  componentWillUnmount() {
    this.endMap()
  }

  endMap() {
    this.props.closeChat()
    this.mapChat.reset()
    // TODO: fix upperOptions ref
    this.upperOptions.reset()
    this.props.endActiveMap()
  }

  componentDidUpdate(prevProps) {
    const oldMapId = prevProps.mapId
    const { mapId, launchNewMap } = this.props
    if (!oldMapId && mapId) launchNewMap(mapId)
    else if (oldMapId && mapId && oldMapId !== mapId) {
      this.endMap()
      launchNewMap(mapId)
    }
    else if (oldMapId && !mapId) this.endMap()
  }

  render = () => {
    const { mobile, map, currentUser, closeChat, openChat, chatIsOpen,
            toggleMapInfoBox, infoBoxHtml, allForFiltering, visibleForFiltering,
            toggleMetacode, toggleMapper, toggleSynapse, filterAllMetacodes,
            filterAllMappers, filterAllSynapses, filterData,
            openImportLightbox, forkMap, openHelpLightbox,
            mapIsStarred, onMapStar, onMapUnstar, openTopic,
            onZoomExtents, onZoomIn, onZoomOut, hasLearnedTopicCreation,
            contextMenu, DataModel } = this.props
    const canEditMap = map && map.authorizeToEdit(currentUser)
    // TODO: stop using {...this.props} and make explicit
    return <div className="mapWrapper">
      <UpperOptions ref={x => this.upperOptions = x} {...this.props} />
      <MapVis map={map} DataModel={DataModel} />
      {openTopic && <TopicCard {...this.props} />}
      {contextMenu && <ContextMenu {...this.props} />}
      {currentUser && <Instructions mobile={mobile} hasLearnedTopicCreation={hasLearnedTopicCreation} />}
      {currentUser && <MapChat {...this.props} onOpen={openChat} onClose={closeChat} chatOpen={chatIsOpen} ref={x => this.mapChat = x} />}
      <VisualizationControls {...this.props} />
      <InfoAndHelp {...this.props} />
    </div>
  }
}
