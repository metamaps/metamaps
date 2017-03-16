/* global $ */

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { merge } from 'lodash'

import { notifyUser } from './index.js'
import ImportDialog from './ImportDialog'
import Active from '../Active'
import DataModel from '../DataModel'
import { ExploreMaps, ChatView, TopicCard } from '../Views'
import Filter from '../Filter'
import JIT from '../JIT'
import Realtime from '../Realtime'
import Map, { InfoBox } from '../Map'
import Topic from '../Topic'
import Visualize from '../Visualize'
import makeRoutes from '../../components/makeRoutes'
let routes

// 220 wide + 16 padding on both sides
const MAP_WIDTH = 252
const MOBILE_VIEW_BREAKPOINT = 504
const MOBILE_VIEW_PADDING = 40
const MAX_COLUMNS = 4

const ReactApp = {
  mapId: null,
  topicId: null,
  unreadNotificationsCount: 0,
  mapsWidth: 0,
  toast: '',
  mobile: false,
  mobileTitle: '',
  mobileTitleWidth: 0,
  init: function(serverData, openLightbox) {
    const self = ReactApp
    self.unreadNotificationsCount = serverData.unreadNotificationsCount
    self.mobileTitle = serverData.mobileTitle
    self.openLightbox = openLightbox
    routes = makeRoutes(serverData.ActiveMapper)
    self.resize()
    window && window.addEventListener('resize', self.resize)
  },
  handleUpdate: function(location) {
    const self = ReactApp
    const pathname = this.state.location.pathname
    switch (pathname.split('/')[1]) {
      case '':
        if (Active.Mapper && Active.Mapper.id) {
          $('#yield').hide()
          ExploreMaps.updateFromPath(pathname)
          self.mapId = null
          Active.Map = null
          Active.Topic = null
        }
        break
      case 'explore':
        $('#yield').hide()
        ExploreMaps.updateFromPath(pathname)
        self.mapId = null
        self.topicId = null
        Active.Map = null
        Active.Topic = null
        break
      case 'topics':
        $('#yield').hide()
        Active.Map = null
        self.mapId = null
        self.topicId = pathname.split('/')[2]
        break
      case 'maps':
        if (!pathname.includes('request_access')) {
          $('#yield').hide()
          Active.Topic = null
          self.topicId = null
          self.mapId = pathname.split('/')[2]
        }
        break
      default:
        $('#yield').show()
        break
    }
    self.render()
    window.ga && window.ga('send', 'pageview', pathname)
  },
  render: function() {
    const self = ReactApp
    const createElement = (Component, props) => <Component {...props} {...self.getProps()}/>
    const app = <Router createElement={createElement} routes={routes} history={browserHistory} onUpdate={self.handleUpdate} />
    console.log('rendering')
    ReactDOM.render(app, document.getElementById('react-app'))
  },
  getProps: function() {
    const self = ReactApp
    return merge({
      unreadNotificationsCount: self.unreadNotificationsCount,
      currentUser: Active.Mapper,
      toast: self.toast,
      mobile: self.mobile,
      mobileTitle: self.mobileTitle,
      mobileTitleWidth: self.mobileTitleWidth,
      mobileTitleClick: (e) => Active.Map && InfoBox.toggleBox(e),
      openInviteLightbox: () => self.openLightbox('invite')
    },
    self.getMapProps(),
    self.getTopicProps(),
    self.getFilterProps(),
    self.getCommonProps(),
    self.getMapsProps(),
    self.getTopicCardProps(),
    self.getChatProps())
  },
  getMapProps: function() {
    const self = ReactApp
    return {
      mapId: self.mapId,
      map: Active.Map,
      hasLearnedTopicCreation: Map.hasLearnedTopicCreation,
      userRequested: Map.userRequested,
      requestAnswered: Map.requestAnswered,
      requestApproved: Map.requestApproved,
      onRequestAccess: Map.requestAccess,
      mapIsStarred: Map.mapIsStarred,
      endActiveMap: Map.end,
      launchNewMap: Map.launch,
      toggleMapInfoBox: InfoBox.toggleBox,
      infoBoxHtml: InfoBox.html,
      openImportLightbox: () => ImportDialog.show(),
      forkMap: Map.fork,
      onMapStar: Map.star,
      onMapUnstar: Map.unstar
    }
  },
  getCommonProps: function() {
    const self = ReactApp
    return {
      openHelpLightbox: () => self.openLightbox('cheatsheet'),
      onZoomExtents: event => JIT.zoomExtents(event, Visualize.mGraph.canvas),
      onZoomIn: JIT.zoomIn,
      onZoomOut: JIT.zoomOut
    }
  },
  getTopicCardProps: function() {
    const self = ReactApp
    return {
      openTopic: TopicCard.openTopic,
      metacodeSets: TopicCard.metacodeSets,
      updateTopic: TopicCard.updateTopic,
      onTopicFollow: TopicCard.onTopicFollow,
      redrawCanvas: TopicCard.redrawCanvas
    }
  },
  getTopicProps: function() {
    const self = ReactApp
    return {
      topicId: self.topicId,
      topic: Active.Topic,
      endActiveTopic: Topic.end,
      launchNewTopic: Topic.launch
    }
  },
  getMapsProps: function() {
    const self = ReactApp
    return {
      section: ExploreMaps.collection && ExploreMaps.collection.id,
      maps: ExploreMaps.collection,
      juntoState: Realtime.juntoState,
      moreToLoad: ExploreMaps.collection && ExploreMaps.collection.page !== 'loadedAll',
      user: ExploreMaps.collection && ExploreMaps.collection.id === 'mapper' ? ExploreMaps.mapper : null,
      loadMore: ExploreMaps.loadMore,
      pending: ExploreMaps.pending,
      onStar: ExploreMaps.onStar,
      onRequest: ExploreMaps.onRequest,
      onMapFollow: ExploreMaps.onMapFollow,
      mapsWidth: ReactApp.mapsWidth
    }
  },
  getChatProps: function() {
    const self = ReactApp
    return {
      unreadMessages: ChatView.unreadMessages,
      conversationLive: ChatView.conversationLive,
      isParticipating: ChatView.isParticipating,
      onOpen: ChatView.onOpen,
      onClose: ChatView.onClose,
      leaveCall: Realtime.leaveCall,
      joinCall: Realtime.joinCall,
      inviteACall: Realtime.inviteACall,
      inviteToJoin: Realtime.inviteToJoin,
      participants: ChatView.participants ? ChatView.participants.models.map(p => p.attributes) : [],
      messages: ChatView.messages ? ChatView.messages.models.map(m => m.attributes) : [],
      videoToggleClick: ChatView.videoToggleClick,
      cursorToggleClick: ChatView.cursorToggleClick,
      soundToggleClick: ChatView.soundToggleClick,
      inputBlur: ChatView.inputBlur,
      inputFocus: ChatView.inputFocus,
      handleInputMessage: ChatView.handleInputMessage
    }
  },
  getFilterProps: function() {
    const self = ReactApp
    return {
      filterData: Filter.dataForPresentation,
      allForFiltering: Filter.filters,
      visibleForFiltering: Filter.visible,
      toggleMetacode: Filter.toggleMetacode,
      toggleMapper: Filter.toggleMapper,
      toggleSynapse: Filter.toggleSynapse,
      filterAllMetacodes: Filter.filterAllMetacodes,
      filterAllMappers: Filter.filterAllMappers,
      filterAllSynapses: Filter.filterAllSynapses
    }
  },
  resize: function() {
    const self = ReactApp
    const maps = ExploreMaps.collection
    const currentUser = Active.Mapper
    const user = maps && maps.id === 'mapper' ? ExploreMaps.mapper : null
    const numCards = (maps ? maps.length : 0) + (user || currentUser ? 1 : 0)
    const mapSpaces = Math.floor(document.body.clientWidth / MAP_WIDTH)
    const mapsWidth = document.body.clientWidth <= MOBILE_VIEW_BREAKPOINT
                        ? document.body.clientWidth - MOBILE_VIEW_PADDING
                        : Math.min(MAX_COLUMNS, Math.min(numCards, mapSpaces)) * MAP_WIDTH

    self.mapsWidth = mapsWidth
    self.mobileTitleWidth = document ? document.body.clientWidth - 70 : 0
    self.mobile = document && document.body.clientWidth <= MOBILE_VIEW_BREAKPOINT
    self.render()
  }
}

export default ReactApp
