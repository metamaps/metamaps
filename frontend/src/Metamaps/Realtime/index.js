/* global $ */

import SimpleWebRTC from 'simplewebrtc'
import SocketIoConnection from 'simplewebrtc/socketioconnection'

import Active from '../Active'
import Cable from '../Cable'
import DataModel from '../DataModel'
import JIT from '../JIT'
import Util from '../Util'
import Views from '../Views'
import { ChatView } from '../Views'
import Visualize from '../Visualize'

import {
  JUNTO_UPDATED,
  INVITED_TO_CALL,
  INVITED_TO_JOIN,
  CALL_ACCEPTED,
  CALL_DENIED,
  INVITE_DENIED,
  CALL_IN_PROGRESS,
  CALL_STARTED,
  MAPPER_LIST_UPDATED,
  MAPPER_JOINED_CALL,
  MAPPER_LEFT_CALL,
  NEW_MAPPER,
  LOST_MAPPER,
  PEER_COORDS_UPDATED,
  TOPIC_DRAGGED
} from './events'

import {
  juntoUpdated,
  invitedToCall,
  invitedToJoin,
  callAccepted,
  callDenied,
  inviteDenied,
  callInProgress,
  callStarted,
  mapperListUpdated,
  mapperJoinedCall,
  mapperLeftCall,
  peerCoordsUpdated,
  newMapper,
  lostMapper,
  topicDragged
} from './receivable'

import {
  joinMap,
  leaveMap,
  checkForCall,
  acceptCall,
  denyCall,
  denyInvite,
  inviteToJoin,
  inviteACall,
  joinCall,
  leaveCall,
  sendCoords,
  sendMapperInfo,
  dragTopic
} from './sendable'

let Realtime = {
  juntoState: { connectedPeople: {}, liveMaps: {} },
  videoId: 'video-wrapper',
  socket: null,
  webrtc: null,
  readyToCall: false,
  mappersOnMap: {},
  disconnected: false,
  chatOpen: false,
  soundId: null,
  broadcastingStatus: false,
  inConversation: false,
  localVideo: null,
  'junto_spinner_darkgrey.gif': '',
  init: function(serverData) {
    var self = Realtime

    self.addJuntoListeners()

    self.socket = new SocketIoConnection({
      url: serverData['REALTIME_SERVER'],
      socketio: {
        // don't poll forever if in development
        reconnectionAttempts: serverData.RAILS_ENV === 'development' ? 5 : Infinity
      }
    })
    self['junto_spinner_darkgrey.gif'] = serverData['junto_spinner_darkgrey.gif']

    self.socket.on('connect', function() {
      console.log('connected')
      if (Active.Map && Active.Mapper && Active.Map.authorizeToEdit(Active.Mapper)) {
        self.checkForCall()
        self.joinMap()
      }
      subscribeToEvents(self, self.socket)
      self.disconnected = false
    })
    self.socket.on('disconnect', function() {
      self.disconnected = true
    })

    if (Active.Mapper) {
      self.webrtc = new SimpleWebRTC({
        connection: self.socket,
        localVideoEl: self.videoId,
        remoteVideosEl: '',
        debug: true,
        detectSpeakingEvents: false, // true,
        autoAdjustMic: false, // true,
        autoRequestMedia: false,
        localVideo: {
          autoplay: true,
          mirror: true,
          muted: true
        },
        media: {
          video: true,
          audio: true
        },
        nick: Active.Mapper.id
      })
      self.webrtc.webrtc.on('iceFailed', function(peer) {
        console.log('local ice failure', peer)
        // local ice failure
      })
      self.webrtc.webrtc.on('connectivityError', function(peer) {
        console.log('remote ice failure', peer)
        // remote ice failure
      })

      var $video = $('<video></video>').attr('id', self.videoId)
      self.localVideo = {
        $video: $video,
        view: new Views.VideoView($video[0], $('body'), 'me', true, {
          DOUBLE_CLICK_TOLERANCE: 200,
          avatar: Active.Mapper ? Active.Mapper.get('image') : ''
        })
      }

      self.room = new Views.Room({
        webrtc: self.webrtc,
        socket: self.socket,
        room: 'global',
        $video: self.localVideo.$video,
        myVideoView: self.localVideo.view,
        config: { DOUBLE_CLICK_TOLERANCE: 200 }
      })
      self.room.videoAdded(self.handleVideoAdded)
      
      self.startActiveMap()
    } // if Active.Mapper
  },
  addJuntoListeners: function() {
    var self = Realtime

    $(document).on(ChatView.events.openTray, function() {
      $('.main').addClass('compressed')
      self.chatOpen = true
      self.positionPeerIcons()
    })
    $(document).on(ChatView.events.closeTray, function() {
      $('.main').removeClass('compressed')
      self.chatOpen = false
      self.positionPeerIcons()
    })
    $(document).on(ChatView.events.videosOn, function() {
      $('#wrapper').removeClass('hideVideos')
    })
    $(document).on(ChatView.events.videosOff, function() {
      $('#wrapper').addClass('hideVideos')
    })
    $(document).on(ChatView.events.cursorsOn, function() {
      $('#wrapper').removeClass('hideCursors')
    })
    $(document).on(ChatView.events.cursorsOff, function() {
      $('#wrapper').addClass('hideCursors')
    })
  },
  startActiveMap: function() {
    var self = Realtime
    if (Active.Map && Active.Mapper) {
      if (Active.Map.authorizeToEdit(Active.Mapper)) {
        self.turnOn()
        self.checkForCall()
        self.joinMap()
      }
      self.setupChat() // chat can happen on public maps too
      Cable.subscribeToMap(Active.Map.id) // people with edit rights can still see live updates
    }
  },
  endActiveMap: function() {
    var self = Realtime
    $(document).off('.map')
    // leave the appropriate rooms to leave
    if (self.inConversation) self.leaveCall()
    self.leaveMap()
    $('.collabCompass').remove()
    if (self.room) self.room.leave()
    ChatView.hide()
    ChatView.close()
    ChatView.reset()
    Cable.unsubscribeFromMap()
  },
  turnOn: function(notify) {
    var self = Realtime
    $('.collabCompass').show()
    self.room.room = 'map-' + Active.Map.id
    self.activeMapper = {
      id: Active.Mapper.id,
      name: Active.Mapper.get('name'),
      username: Active.Mapper.get('name'),
      image: Active.Mapper.get('image'),
      color: Util.getPastelColor(),
      self: true
    }
    self.localVideo.view.$container.find('.video-cutoff').css({
      border: '4px solid ' + self.activeMapper.color
    })
    self.setupLocalEvents()
  },
  setupChat: function() {
    const self = Realtime
    ChatView.setNewMap()
    ChatView.addParticipant(self.activeMapper)
    ChatView.addMessages(new DataModel.MessageCollection(DataModel.Messages), true)
    ChatView.show()
  },
  setupLocalEvents: function() {
    var self = Realtime
    // local event listeners that trigger events
    $(document).on(JIT.events.zoom + '.map', self.positionPeerIcons)
    $(document).on(JIT.events.pan + '.map', self.positionPeerIcons)
    $(document).on('mousemove.map', function(event) {
      var pixels = {
        x: event.pageX,
        y: event.pageY
      }
      var coords = Util.pixelsToCoords(Visualize.mGraph, pixels)
      self.sendCoords(coords)
    })
    $(document).on(JIT.events.topicDrag + '.map', function(event, positions) {
      self.dragTopic(positions)
    })
  },
  countOthersInConversation: function() {
    var self = Realtime
    var count = 0
    for (var key in self.mappersOnMap) {
      if (self.mappersOnMap[key].inConversation) count++
    }
    return count
  },
  handleVideoAdded: function(v, id) {
    var self = Realtime
    self.positionVideos()
    v.setParent($('#wrapper'))
    v.$container.find('.video-cutoff').css({
      border: '4px solid ' + self.mappersOnMap[id].color
    })
    $('#wrapper').append(v.$container)
  },
  positionVideos: function() {
    var self = Realtime
    var videoIds = Object.keys(self.room.videos)
    // var numOfVideos = videoIds.length
    // var numOfVideosToPosition = _.filter(videoIds, function(id) {
    //   return !self.room.videos[id].manuallyPositioned
    // }).length

    var screenHeight = $(document).height()
    var topExtraPadding = 20
    var topPadding = 30
    var leftPadding = 30
    var videoHeight = 150
    var videoWidth = 180
    var column = 0
    var row = 0
    var yFormula = function() {
      var y = topExtraPadding + (topPadding + videoHeight) * row + topPadding
      if (y + videoHeight > screenHeight) {
        row = 0
        column += 1
        y = yFormula()
      }
      row++
      return y
    }
    var xFormula = function() {
      var x = (leftPadding + videoWidth) * column + leftPadding
      return x
    }

    // do self first
    var myVideo = Realtime.localVideo.view
    if (!myVideo.manuallyPositioned) {
      myVideo.$container.css({
        top: yFormula() + 'px',
        left: xFormula() + 'px'
      })
    }
    videoIds.forEach(function(id) {
      var video = self.room.videos[id]
      if (!video.manuallyPositioned) {
        video.$container.css({
          top: yFormula() + 'px',
          left: xFormula() + 'px'
        })
      }
    })
  },
  callEnded: function() {
    var self = Realtime

    ChatView.conversationEnded()
    self.room.leaveVideoOnly()
    self.inConversation = false
    self.localVideo.view.$container.hide().css({
      top: '72px',
      left: '30px'
    })
    self.localVideo.view.audioOn()
    self.localVideo.view.videoOn()
  },
  createCompass: function(name, id, image, color) {
    var str = '<img width="28" height="28" src="' + image + '" /><p>' + name + '</p>'
    str += '<div id="compassArrow' + id + '" class="compassArrow"></div>'
    $('#compass' + id).remove()
    $('<div/>', {
      id: 'compass' + id,
      class: 'collabCompass'
    }).html(str).appendTo('#wrapper')
    $('#compass' + id + ' img').css({
      'border': '2px solid ' + color
    })
    $('#compass' + id + ' p').css({
      'background-color': color
    })
  },
  positionPeerIcons: function() {
    var self = Realtime
    for (var key in self.mappersOnMap) {
      self.positionPeerIcon(key)
    }
  },
  positionPeerIcon: function(id) {
    var self = Realtime
    var mapper = self.mappersOnMap[id]

    var origPixels = Util.coordsToPixels(Visualize.mGraph, mapper.coords)
    var pixels = self.limitPixelsToScreen(origPixels)
    $('#compass' + id).css({
      left: pixels.x + 'px',
      top: pixels.y + 'px'
    })
    /* showing the arrow if the collaborator is off of the viewport screen */
    if (origPixels.x !== pixels.x || origPixels.y !== pixels.y) {
      var dy = origPixels.y - pixels.y // opposite
      var dx = origPixels.x - pixels.x // adjacent
      var angle = Math.atan2(dy, dx)

      $('#compassArrow' + id).show().css({
        transform: 'rotate(' + angle + 'rad)',
        '-webkit-transform': 'rotate(' + angle + 'rad)'
      })

      if (dx > 0) {
        $('#compass' + id).addClass('labelLeft')
      }
    } else {
      $('#compassArrow' + id).hide()
      $('#compass' + id).removeClass('labelLeft')
    }
  },
  limitPixelsToScreen: function(pixels) {
    var self = Realtime

    var boundary = self.chatOpen ? '#wrapper' : document
    var xLimit, yLimit
    var xMax = $(boundary).width()
    var yMax = $(boundary).height()
    var compassDiameter = 56
    var compassArrowSize = 24

    xLimit = Math.max(0 + compassArrowSize, pixels.x)
    xLimit = Math.min(xLimit, xMax - compassDiameter)
    yLimit = Math.max(0 + compassArrowSize, pixels.y)
    yLimit = Math.min(yLimit, yMax - compassDiameter)

    return {x: xLimit, y: yLimit}
  }
}

const sendables = [
  ['joinMap', joinMap],
  ['leaveMap', leaveMap],
  ['checkForCall', checkForCall],
  ['acceptCall', acceptCall],
  ['denyCall', denyCall],
  ['denyInvite', denyInvite],
  ['inviteToJoin', inviteToJoin],
  ['inviteACall', inviteACall],
  ['joinCall', joinCall],
  ['leaveCall', leaveCall],
  ['sendMapperInfo', sendMapperInfo],
  ['sendCoords', sendCoords],
  ['dragTopic', dragTopic]
]
sendables.forEach(sendable => {
  Realtime[sendable[0]] = sendable[1](Realtime)
})

const subscribeToEvents = (Realtime, socket) => {
  socket.on(JUNTO_UPDATED, juntoUpdated(Realtime))
  socket.on(INVITED_TO_CALL, invitedToCall(Realtime))
  socket.on(INVITED_TO_JOIN, invitedToJoin(Realtime))
  socket.on(CALL_ACCEPTED, callAccepted(Realtime))
  socket.on(CALL_DENIED, callDenied(Realtime))
  socket.on(INVITE_DENIED, inviteDenied(Realtime))
  socket.on(CALL_IN_PROGRESS, callInProgress(Realtime))
  socket.on(CALL_STARTED, callStarted(Realtime))
  socket.on(MAPPER_LIST_UPDATED, mapperListUpdated(Realtime))
  socket.on(MAPPER_JOINED_CALL, mapperJoinedCall(Realtime))
  socket.on(MAPPER_LEFT_CALL, mapperLeftCall(Realtime))
  socket.on(PEER_COORDS_UPDATED, peerCoordsUpdated(Realtime))
  socket.on(NEW_MAPPER, newMapper(Realtime))
  socket.on(LOST_MAPPER, lostMapper(Realtime))
  socket.on(TOPIC_DRAGGED, topicDragged(Realtime))
}

export default Realtime
