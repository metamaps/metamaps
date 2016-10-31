/* global Metamaps, $ */

/*
 * Metamaps.Realtime.js
 *
 * Dependencies:
 *  - Metamaps.Backbone
 *  - Metamaps.Erb
 *  - Metamaps.Mappers
 *  - Metamaps.Mappings
 *  - Metamaps.Messages
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 */

import _ from 'lodash'
import SimpleWebRTC from 'simplewebrtc'
import SocketIoConnection from 'simplewebrtc/socketioconnection'

import Active from '../Active'
import GlobalUI from '../GlobalUI'
import JIT from '../JIT'
import Synapse from '../Synapse'
import Topic from '../Topic'
import Util from '../Util'
import Views from '../Views'
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
  MESSAGE_CREATED,
  TOPIC_DRAGGED,
  TOPIC_CREATED,
  TOPIC_UPDATED,
  TOPIC_REMOVED,
  TOPIC_DELETED,
  SYNAPSE_CREATED,
  SYNAPSE_UPDATED,
  SYNAPSE_REMOVED,
  SYNAPSE_DELETED,
  PEER_COORDS_UPDATED,
  MAP_UPDATED
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
  messageCreated,
  topicDragged,
  topicCreated,
  topicUpdated,
  topicRemoved,
  topicDeleted,
  synapseCreated,
  synapseUpdated,
  synapseRemoved,
  synapseDeleted,
  mapUpdated,
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
  createMessage,
  dragTopic,
  createTopic,
  updateTopic,
  removeTopic,
  deleteTopic,
  createSynapse,
  updateSynapse,
  removeSynapse,
  deleteSynapse,
  updateMap
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
  init: function () {
    var self = Realtime

    self.addJuntoListeners()

    self.socket = new SocketIoConnection({ url: Metamaps.Erb['REALTIME_SERVER']})
    
    self.socket.on('connect', function () {
      console.log('connected')
      subscribeToEvents(self, self.socket)

      if (!self.disconnected) {
        self.startActiveMap()
      } else self.disconnected = false
    })
    self.socket.on('disconnect', function () {
      self.disconnected = true
    })

    if (Active.Mapper) {
      self.webrtc = new SimpleWebRTC({
        connection: self.socket,
        localVideoEl: self.videoId,
        remoteVideosEl: '',
        debug: true,
        detectSpeakingEvents: false, //true,
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
      self.webrtc.webrtc.on('iceFailed', function (peer) {
        console.log('local ice failure', peer)
        // local ice failure
      })
      self.webrtc.webrtc.on('connectivityError', function (peer) {
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
        username: Active.Mapper ? Active.Mapper.get('name') : '',
        image: Active.Mapper ? Active.Mapper.get('image') : '',
        room: 'global',
        $video: self.localVideo.$video,
        myVideoView: self.localVideo.view,
        config: { DOUBLE_CLICK_TOLERANCE: 200 }
      })
      self.room.videoAdded(self.handleVideoAdded)

      if (!Active.Map) {
        self.room.chat.$container.hide()
      }
      $('body').prepend(self.room.chat.$container)
    } // if Active.Mapper
  },
  addJuntoListeners: function () {
    var self = Realtime

    $(document).on(Views.ChatView.events.openTray, function () {
      $('.main').addClass('compressed')
      self.chatOpen = true
      self.positionPeerIcons()
    })
    $(document).on(Views.ChatView.events.closeTray, function () {
      $('.main').removeClass('compressed')
      self.chatOpen = false
      self.positionPeerIcons()
    })
    $(document).on(Views.ChatView.events.videosOn, function () {
      $('#wrapper').removeClass('hideVideos')
    })
    $(document).on(Views.ChatView.events.videosOff, function () {
      $('#wrapper').addClass('hideVideos')
    })
    $(document).on(Views.ChatView.events.cursorsOn, function () {
      $('#wrapper').removeClass('hideCursors')
    })
    $(document).on(Views.ChatView.events.cursorsOff, function () {
      $('#wrapper').addClass('hideCursors')
    })
  },
  startActiveMap: function () {
    var self = Realtime
    if (Active.Map && Active.Mapper) {
      if (Active.Map.authorizeToEdit(Active.Mapper)) {
        self.turnOn()
        self.setupSocket()
        self.setupLocalSendables()
      }
      self.room.addMessages(new Metamaps.Backbone.MessageCollection(Metamaps.Messages), true)
    }
  },
  endActiveMap: function () {
    var self = Realtime
    $(document).off('.map')
    // leave the appropriate rooms to leave
    if (self.inConversation) self.leaveCall()
    self.leaveMap()
    $('.collabCompass').remove()
    if (self.room) {
      self.room.leave()
      self.room.chat.$container.hide()
      self.room.chat.close()
    }
  },
  turnOn: function (notify) {
    var self = Realtime
    $('.collabCompass').show()
    self.room.chat.$container.show()
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
    self.room.chat.addParticipant(self.activeMapper)
  },
  setupSocket: function () {
    var self = Realtime
    self.checkForCall()
    self.joinMap()
  },
  setupLocalSendables: function () {
    var self = Realtime

    // local event listeners that trigger events
    var sendCoords = function (event) {
      var pixels = {
        x: event.pageX,
        y: event.pageY
      }
      var coords = Util.pixelsToCoords(Visualize.mGraph, pixels)
      self.sendCoords(coords)
    }
    $(document).on('mousemove.map', sendCoords)

    var zoom = function (event, e) {
      if (e) {
        var pixels = {
          x: e.pageX,
          y: e.pageY
        }
        var coords = Util.pixelsToCoords(Visualize.mGraph, pixels)
        self.sendCoords(coords)
      }
      self.positionPeerIcons()
    }
    $(document).on(JIT.events.zoom + '.map', zoom)

    $(document).on(JIT.events.pan + '.map', self.positionPeerIcons)

    var dragTopic = function (event, positions) {
      self.dragTopic(positions)
    }
    $(document).on(JIT.events.topicDrag + '.map', dragTopic)

    var createTopic = function (event, data) {
      self.createTopic(data)
    }
    $(document).on(JIT.events.newTopic + '.map', createTopic)

    var deleteTopic = function (event, data) {
      self.deleteTopic(data)
    }
    $(document).on(JIT.events.deleteTopic + '.map', deleteTopic)

    var removeTopic = function (event, data) {
      self.removeTopic(data)
    }
    $(document).on(JIT.events.removeTopic + '.map', removeTopic)

    var createSynapse = function (event, data) {
      self.createSynapse(data)
    }
    $(document).on(JIT.events.newSynapse + '.map', createSynapse)

    var deleteSynapse = function (event, data) {
      self.deleteSynapse(data)
    }
    $(document).on(JIT.events.deleteSynapse + '.map', deleteSynapse)

    var removeSynapse = function (event, data) {
      self.removeSynapse(data)
    }
    $(document).on(JIT.events.removeSynapse + '.map', removeSynapse)

    var createMessage = function (event, data) {
      self.createMessage(data)
    }
    $(document).on(Views.Room.events.newMessage + '.map', createMessage)
  },
  countOthersInConversation: function () {
    var self = Realtime
    var count = 0
    for (var key in self.mappersOnMap) {
      if (self.mappersOnMap[key].inConversation) count++
    }
    return count
  },
  handleVideoAdded: function (v, id) {
    var self = Realtime
    self.positionVideos()
    v.setParent($('#wrapper'))
    v.$container.find('.video-cutoff').css({
      border: '4px solid ' + self.mappersOnMap[id].color
    })
    $('#wrapper').append(v.$container)
  },
  positionVideos: function () {
    var self = Realtime
    var videoIds = Object.keys(self.room.videos)
    var numOfVideos = videoIds.length
    var numOfVideosToPosition = _.filter(videoIds, function (id) {
      return !self.room.videos[id].manuallyPositioned
    }).length

    var screenHeight = $(document).height()
    var screenWidth = $(document).width()
    var topExtraPadding = 20
    var topPadding = 30
    var leftPadding = 30
    var videoHeight = 150
    var videoWidth = 180
    var column = 0
    var row = 0
    var yFormula = function () {
      var y = topExtraPadding + (topPadding + videoHeight) * row + topPadding
      if (y + videoHeight > screenHeight) {
        row = 0
        column += 1
        y = yFormula()
      }
      row++
      return y
    }
    var xFormula = function () {
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
    videoIds.forEach(function (id) {
      var video = self.room.videos[id]
      if (!video.manuallyPositioned) {
        video.$container.css({
          top: yFormula() + 'px',
          left: xFormula() + 'px'
        })
      }
    })
  },
  callEnded: function () {
    var self = Realtime

    self.room.conversationEnding()
    self.room.leaveVideoOnly()
    self.inConversation = false
    self.localVideo.view.$container.hide().css({
      top: '72px',
      left: '30px'
    })
    self.localVideo.view.audioOn()
    self.localVideo.view.videoOn()
  },
  createCompass: function (name, id, image, color) {
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
  positionPeerIcons: function () {
    var self = Realtime
    for (var key in self.mappersOnMap) {
      self.positionPeerIcon(key)
    }
  },
  positionPeerIcon: function (id) {
    var self = Realtime
    var boundary = self.chatOpen ? '#wrapper' : document
    var mapper = self.mappersOnMap[id]
    var xMax = $(boundary).width()
    var yMax = $(boundary).height()
    var compassDiameter = 56
    var compassArrowSize = 24

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
      var ratio = dy / dx
      var angle = Math.atan2(dy, dx)

      $('#compassArrow' + id).show().css({
        transform: 'rotate(' + angle + 'rad)',
        '-webkit-transform': 'rotate(' + angle + 'rad)',
      })

      if (dx > 0) {
        $('#compass' + id).addClass('labelLeft')
      }
    } else {
      $('#compassArrow' + id).hide()
      $('#compass' + id).removeClass('labelLeft')
    }
  },
  limitPixelsToScreen: function (pixels) {
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

    return {x: xLimit,y: yLimit}
  }
}

const sendables = [
  ['joinMap',joinMap],
  ['leaveMap',leaveMap],
  ['checkForCall',checkForCall],
  ['acceptCall',acceptCall],
  ['denyCall',denyCall],
  ['denyInvite',denyInvite],
  ['inviteToJoin',inviteToJoin],
  ['inviteACall',inviteACall],
  ['joinCall',joinCall],
  ['leaveCall',leaveCall],
  ['sendMapperInfo',sendMapperInfo],
  ['sendCoords',sendCoords],
  ['createMessage',createMessage],
  ['dragTopic',dragTopic],
  ['createTopic',createTopic],
  ['updateTopic',updateTopic],
  ['removeTopic',removeTopic],
  ['deleteTopic',deleteTopic],
  ['createSynapse',createSynapse],
  ['updateSynapse',updateSynapse],
  ['removeSynapse',removeSynapse],
  ['deleteSynapse',deleteSynapse],
  ['updateMap',updateMap]
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
    socket.on(MESSAGE_CREATED, messageCreated(Realtime))
    socket.on(TOPIC_DRAGGED, topicDragged(Realtime))
    socket.on(TOPIC_CREATED, topicCreated(Realtime))
    socket.on(TOPIC_UPDATED, topicUpdated(Realtime))
    socket.on(TOPIC_REMOVED, topicRemoved(Realtime))
    socket.on(TOPIC_DELETED, topicDeleted(Realtime))
    socket.on(SYNAPSE_CREATED, synapseCreated(Realtime))
    socket.on(SYNAPSE_UPDATED, synapseUpdated(Realtime))
    socket.on(SYNAPSE_REMOVED, synapseRemoved(Realtime))
    socket.on(SYNAPSE_DELETED, synapseDeleted(Realtime))
    socket.on(MAP_UPDATED, mapUpdated(Realtime))
}

export default Realtime
