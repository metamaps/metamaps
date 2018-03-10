/* global $ */

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { merge } from 'lodash'
import apply from 'async/apply'

import { notifyUser } from './index.js'
import ImportDialog from './ImportDialog'
import Notifications from './Notifications'
import Active from '../Active'
import Create from '../Create'
import DataModel from '../DataModel'
import DataFetcher from '../DataFetcher'
import { ExploreMaps, ChatView, TopicCard, ContextMenu } from '../Views'
import Filter from '../Filter'
import JIT from '../JIT'
import PasteInput from '../PasteInput'
import Realtime from '../Realtime'
import Map, { InfoBox } from '../Map'
import Topic from '../Topic'
import Visualize from '../Visualize'
import makeRoutes from '../../routes/makeRoutes'
let routes

// 220 wide + 16 padding on both sides
const MAP_WIDTH = 252
const MOBILE_VIEW_BREAKPOINT = 504
const MOBILE_VIEW_PADDING = 40
const MAX_COLUMNS = 4

const ReactApp = {
  serverData: {},
  mapId: null,
  topicId: null,
  mapsWidth: 0,
  toast: '',
  mobile: false,
  mobileTitle: '',
  mobileTitleWidth: 0,
  metacodeSets: [],
  init: function(serverData, openLightbox) {
    const self = ReactApp
    self.serverData = serverData
    self.mobileTitle = serverData.mobileTitle
    self.openLightbox = openLightbox
    self.metacodeSets = serverData.metacodeSets
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
          ExploreMaps.updateFromPath(pathname)
          self.mapId = null
          Active.Map = null
          Active.Topic = null
        }
        break
      case 'explore':
        ExploreMaps.updateFromPath(pathname)
        self.mapId = null
        self.topicId = null
        Active.Map = null
        Active.Topic = null
        break
      case 'topics':
        Active.Map = null
        self.mapId = null
        self.topicId = pathname.split('/')[2]
        break
      case 'maps':
        if (!pathname.includes('request_access')) {
          Active.Topic = null
          self.topicId = null
          self.mapId = pathname.split('/')[2]
        }
        break
      default:
        break
    }
    self.render()
    window.ga && window.ga('send', 'pageview', pathname)
  },
  render: function() {
    const self = ReactApp
    const createElement = (Component, props) => <Component {...props} {...self.getProps()}/>
    const app = <Router createElement={createElement} routes={routes} history={browserHistory} onUpdate={self.handleUpdate} />
    ReactDOM.render(app, document.getElementById('app'))
  },
  getProps: function() {
    const self = ReactApp
    return merge({
      unreadNotificationsCount: Notifications.unreadNotificationsCount,
      currentUser: Active.Mapper,
      toast: self.toast,
      mobile: self.mobile,
      mobileTitle: self.mobileTitle,
      mobileTitleWidth: self.mobileTitleWidth,
      mobileTitleClick: (e) => Active.Map && InfoBox.toggleBox(e),
      openInviteLightbox: () => self.openLightbox('invite'),
      serverData: self.serverData,
      notifications: Notifications.notifications,
      notificationsLoading: Notifications.notificationsLoading,
      fetchNotifications: apply(Notifications.fetchNotifications, ReactApp.render),
      fetchNotification: apply(Notifications.fetchNotification, ReactApp.render),
      markAsRead: apply(Notifications.markAsRead, ReactApp.render),
      markAsUnread: apply(Notifications.markAsUnread, ReactApp.render),
      denyAccessRequest: DataFetcher.denyAccessRequest,
      approveAccessRequest: DataFetcher.approveAccessRequest,
      metacodes: DataModel.Metacodes.toJSON()
    },
    self.getMapProps(),
    self.getTopicProps(),
    self.getFilterProps(),
    self.getCommonProps(),
    self.getMapsProps(),
    self.getContextMenuProps(),
    self.getTopicCardProps(),
    self.getChatProps(),
    self.getAdminProps())
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
      openMetacodeSwitcher: () => self.openLightbox('metacodeSwitcher'),
      forkMap: Map.fork,
      onMapStar: Map.star,
      onMapUnstar: Map.unstar,
      initNewTopic: Create.newTopic.init,
      initNewSynapse: Create.newSynapse.init,
      importHandleFile: PasteInput.handleFile,
      downloadScreenshot: ImportDialog.downloadScreenshot,
      onExport: format => () => {
        window.open(`${window.location.pathname}/export.${format}`, '_blank')
      },
      requestAccess: DataFetcher.requestAccess
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
      metacodeSets: self.metacodeSets,
      updateTopic: (topic, obj) => topic.save(obj),
      onTopicFollow: Topic.onTopicFollow
    }
  },
  getContextMenuProps: function() {
    const { render } = ReactApp
    return {
      // values
      contextMenu: !!(ContextMenu.clickedNode || ContextMenu.clickedEdge),
      contextNode: ContextMenu.clickedNode,
      contextEdge: ContextMenu.clickedEdge,
      contextPos: ContextMenu.pos,
      contextFetchingSiblingsData: ContextMenu.fetchingSiblingsData,
      contextSiblingsData: ContextMenu.siblingsData,
      // functions
      contextDelete: apply(ContextMenu.delete, render),
      contextRemove: apply(ContextMenu.remove, render),
      contextHide: apply(ContextMenu.hide, render),
      contextCenterOn: apply(ContextMenu.centerOn, render),
      contextPopoutTopic: apply(ContextMenu.popoutTopic, render),
      contextUpdatePermissions: apply(ContextMenu.updatePermissions, render),
      contextOnMetacodeSelect: apply(ContextMenu.onMetacodeSelect, render),
      contextFetchSiblings: apply(ContextMenu.fetchSiblings, render),
      contextPopulateSiblings: apply(ContextMenu.populateSiblings, render)
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
  getAdminProps: function() {
    const self = ReactApp
    return {
      createMetacodeSet: DataFetcher.createMetacodeSet,
      updateMetacodeSet: DataFetcher.updateMetacodeSet,
      deleteMetacodeSet: DataFetcher.deleteMetacodeSet,
      createMetacode: DataFetcher.createMetacode,
      updateMetacode: DataFetcher.updateMetacode
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
