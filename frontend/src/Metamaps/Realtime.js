/* global Metamaps, $, SocketIoConnection, SimpleWebRTC */

import _ from 'lodash'

import Active from './Active'
import Control from './Control'
import GlobalUI from './GlobalUI'
import JIT from './JIT'
import Map from './Map'
import Mapper from './Mapper'
import Synapse from './Synapse'
import Topic from './Topic'
import Util from './Util'
import Views from './Views'
import Visualize from './Visualize'

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

const Realtime = {
  videoId: 'video-wrapper',
  socket: null,
  webrtc: null,
  readyToCall: false,
  mappersOnMap: {},
  disconnected: false,
  chatOpen: false,
  status: true, // stores whether realtime is True/On or False/Off,
  broadcastingStatus: false,
  inConversation: false,
  localVideo: null,
  init: function () {
    var self = Realtime

    self.addJuntoListeners()

    self.socket = new SocketIoConnection({ url: Metamaps.Erb['REALTIME_SERVER']})
    self.socket.on('connect', function () {
      console.log('connected')
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
        detectSpeakingEvents: true,
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
  startActiveMap: function () {
    var self = Realtime

    if (Active.Map && Active.Mapper) {
      if (Active.Map.authorizeToEdit(Active.Mapper)) {
        self.turnOn()
        self.setupSocket()
      } else {
        self.attachMapListener()
      }
      self.room.addMessages(new Metamaps.Backbone.MessageCollection(Metamaps.Messages), true)
    }
  },
  endActiveMap: function () {
    var self = Realtime

    $(document).off('.map')
    self.socket.removeAllListeners()
    if (self.inConversation) self.leaveCall()
    self.socket.emit('endMapperNotify')
    $('.collabCompass').remove()
    self.status = false
    if (self.room) {
      self.room.leave()
      self.room.chat.$container.hide()
      self.room.chat.close()
    }
  },
  turnOn: function (notify) {
    var self = Realtime

    if (notify) self.sendRealtimeOn()
    self.status = true
    $('.collabCompass').show()
    self.room.chat.$container.show()
    self.room.room = 'map-' + Active.Map.id
    self.checkForACallToJoin()

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
  checkForACallToJoin: function () {
    var self = Realtime
    self.socket.emit('checkForCall', { room: self.room.room, mapid: Active.Map.id })
  },
  promptToJoin: function () {
    var self = Realtime

    var notifyText = "There's a conversation happening, want to join?"
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.GlobalUI.clearNotify()">No</button>'
    GlobalUI.notifyUser(notifyText, true)
    self.room.conversationInProgress()
  },
  conversationHasBegun: function () {
    var self = Realtime

    if (self.inConversation) return
    var notifyText = "There's a conversation starting, want to join?"
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.GlobalUI.clearNotify()">No</button>'
    GlobalUI.notifyUser(notifyText, true)
    self.room.conversationInProgress()
  },
  countOthersInConversation: function () {
    var self = Realtime
    var count = 0

    for (var key in self.mappersOnMap) {
      if (self.mappersOnMap[key].inConversation) count++
    }
    return count
  },
  mapperJoinedCall: function (id) {
    var self = Realtime
    var mapper = self.mappersOnMap[id]

    if (mapper) {
      if (self.inConversation) {
        var username = mapper.name
        var notifyText = username + ' joined the call'
        GlobalUI.notifyUser(notifyText)
      }

      mapper.inConversation = true
      self.room.chat.mapperJoinedCall(id)
    }
  },
  mapperLeftCall: function (id) {
    var self = Realtime
    var mapper = self.mappersOnMap[id]

    if (mapper) {
      if (self.inConversation) {
        var username = mapper.name
        var notifyText = username + ' left the call'
        GlobalUI.notifyUser(notifyText)
      }

      mapper.inConversation = false
      self.room.chat.mapperLeftCall(id)

      if ((self.inConversation && self.countOthersInConversation() === 0) ||
        (!self.inConversation && self.countOthersInConversation() === 1)) {
        self.callEnded()
      }
    }
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
    self.webrtc.webrtc.localStreams.forEach(function (stream) {
      stream.getTracks().forEach(function (track) {
        track.stop()
      })
    })
    self.webrtc.webrtc.localStreams = []
  },
  invitedToCall: function (inviter) {
    var self = Realtime

    self.room.chat.sound.stop('sessioninvite')
    self.room.chat.sound.play('sessioninvite')

    var username = self.mappersOnMap[inviter].name
    var notifyText = '<img src="' + Metamaps.Erb['junto_spinner_darkgrey.gif'] + '" style="display: inline-block; margin-top: -12px; vertical-align: top;" />'
    notifyText += username + ' is inviting you to a conversation. Join live?'
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.acceptCall(' + inviter + ')">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.Realtime.denyCall(' + inviter + ')">No</button>'
    GlobalUI.notifyUser(notifyText, true)
  },
  invitedToJoin: function (inviter) {
    var self = Realtime

    self.room.chat.sound.stop('sessioninvite')
    self.room.chat.sound.play('sessioninvite')

    var username = self.mappersOnMap[inviter].name
    var notifyText = username + ' is inviting you to the conversation. Join?'
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.Realtime.denyInvite(' + inviter + ')">No</button>'
    GlobalUI.notifyUser(notifyText, true)
  },
  acceptCall: function (userid) {
    var self = Realtime
    self.room.chat.sound.stop('sessioninvite')
    self.socket.emit('callAccepted', {
      mapid: Active.Map.id,
      invited: Active.Mapper.id,
      inviter: userid
    })
    $.post('/maps/' + Active.Map.id + '/events/conversation')
    self.joinCall()
    GlobalUI.clearNotify()
  },
  denyCall: function (userid) {
    var self = Realtime
    self.room.chat.sound.stop('sessioninvite')
    self.socket.emit('callDenied', {
      mapid: Active.Map.id,
      invited: Active.Mapper.id,
      inviter: userid
    })
    GlobalUI.clearNotify()
  },
  denyInvite: function (userid) {
    var self = Realtime
    self.room.chat.sound.stop('sessioninvite')
    self.socket.emit('inviteDenied', {
      mapid: Active.Map.id,
      invited: Active.Mapper.id,
      inviter: userid
    })
    GlobalUI.clearNotify()
  },
  inviteACall: function (userid) {
    var self = Realtime
    self.socket.emit('inviteACall', {
      mapid: Active.Map.id,
      inviter: Active.Mapper.id,
      invited: userid
    })
    self.room.chat.invitationPending(userid)
    GlobalUI.clearNotify()
  },
  inviteToJoin: function (userid) {
    var self = Realtime
    self.socket.emit('inviteToJoin', {
      mapid: Active.Map.id,
      inviter: Active.Mapper.id,
      invited: userid
    })
    self.room.chat.invitationPending(userid)
  },
  callAccepted: function (userid) {
    var self = Realtime

    var username = self.mappersOnMap[userid].name
    GlobalUI.notifyUser('Conversation starting...')
    self.joinCall()
    self.room.chat.invitationAnswered(userid)
  },
  callDenied: function (userid) {
    var self = Realtime

    var username = self.mappersOnMap[userid].name
    GlobalUI.notifyUser(username + " didn't accept your invitation")
    self.room.chat.invitationAnswered(userid)
  },
  inviteDenied: function (userid) {
    var self = Realtime

    var username = self.mappersOnMap[userid].name
    GlobalUI.notifyUser(username + " didn't accept your invitation")
    self.room.chat.invitationAnswered(userid)
  },
  joinCall: function () {
    var self = Realtime

    self.webrtc.off('readyToCall')
    self.webrtc.once('readyToCall', function () {
      self.videoInitialized = true
      self.readyToCall = true
      self.localVideo.view.manuallyPositioned = false
      self.positionVideos()
      self.localVideo.view.$container.show()
      if (self.localVideo && self.status) {
        $('#wrapper').append(self.localVideo.view.$container)
      }
      self.room.join()
    })
    self.inConversation = true
    self.socket.emit('mapperJoinedCall', {
      mapid: Active.Map.id,
      id: Active.Mapper.id
    })
    self.webrtc.startLocalVideo()
    GlobalUI.clearNotify()
    self.room.chat.mapperJoinedCall(Active.Mapper.id)
  },
  leaveCall: function () {
    var self = Realtime

    self.socket.emit('mapperLeftCall', {
      mapid: Active.Map.id,
      id: Active.Mapper.id
    })

    self.room.chat.mapperLeftCall(Active.Mapper.id)
    self.room.leaveVideoOnly()
    self.inConversation = false
    self.localVideo.view.$container.hide()

    // if there's only two people in the room, and we're leaving
    // we should shut down the call locally
    if (self.countOthersInConversation() === 1) {
      self.callEnded()
    }
  },
  turnOff: function (silent) {
    var self = Realtime

    if (self.status) {
      if (!silent) self.sendRealtimeOff()
      // $(".rtMapperSelf").removeClass('littleRtOn').addClass('littleRtOff')
      // $('.rtOn').removeClass('active')
      // $('.rtOff').addClass('active')
      self.status = false
      // $(".sidebarCollaborateIcon").removeClass("blue")
      $('.collabCompass').hide()
      $('#' + self.videoId).remove()
    }
  },
  setupSocket: function () {
    var self = Realtime
    var socket = Realtime.socket
    var myId = Active.Mapper.id

    socket.emit('newMapperNotify', {
      userid: myId,
      username: Active.Mapper.get('name'),
      userimage: Active.Mapper.get('image'),
      mapid: Active.Map.id
    })

    socket.on(myId + '-' + Active.Map.id + '-invitedToCall', self.invitedToCall) // new call
    socket.on(myId + '-' + Active.Map.id + '-invitedToJoin', self.invitedToJoin) // call already in progress
    socket.on(myId + '-' + Active.Map.id + '-callAccepted', self.callAccepted)
    socket.on(myId + '-' + Active.Map.id + '-callDenied', self.callDenied)
    socket.on(myId + '-' + Active.Map.id + '-inviteDenied', self.inviteDenied)

    // receive word that there's a conversation in progress
    socket.on('maps-' + Active.Map.id + '-callInProgress', self.promptToJoin)
    socket.on('maps-' + Active.Map.id + '-callStarting', self.conversationHasBegun)

    socket.on('maps-' + Active.Map.id + '-mapperJoinedCall', self.mapperJoinedCall)
    socket.on('maps-' + Active.Map.id + '-mapperLeftCall', self.mapperLeftCall)

    // if you're the 'new guy' update your list with who's already online
    socket.on(myId + '-' + Active.Map.id + '-UpdateMapperList', self.updateMapperList)

    // receive word that there's a new mapper on the map
    socket.on('maps-' + Active.Map.id + '-newmapper', self.newPeerOnMap)

    // receive word that a mapper left the map
    socket.on('maps-' + Active.Map.id + '-lostmapper', self.lostPeerOnMap)

    // receive word that there's a mapper turned on realtime
    socket.on('maps-' + Active.Map.id + '-newrealtime', self.newCollaborator)

    // receive word that there's a mapper turned on realtime
    socket.on('maps-' + Active.Map.id + '-lostrealtime', self.lostCollaborator)

    //
    socket.on('maps-' + Active.Map.id + '-topicDrag', self.topicDrag)

    //
    socket.on('maps-' + Active.Map.id + '-newTopic', self.newTopic)

    //
    socket.on('maps-' + Active.Map.id + '-newMessage', self.newMessage)

    //
    socket.on('maps-' + Active.Map.id + '-removeTopic', self.removeTopic)

    //
    socket.on('maps-' + Active.Map.id + '-newSynapse', self.newSynapse)

    //
    socket.on('maps-' + Active.Map.id + '-removeSynapse', self.removeSynapse)

    // update mapper compass position
    socket.on('maps-' + Active.Map.id + '-updatePeerCoords', self.updatePeerCoords)

    // deletions
    socket.on('deleteTopicFromServer', self.removeTopic)
    socket.on('deleteSynapseFromServer', self.removeSynapse)

    socket.on('topicChangeFromServer', self.topicChange)
    socket.on('synapseChangeFromServer', self.synapseChange)
    self.attachMapListener()

    // local event listeners that trigger events
    var sendCoords = function (event) {
      var pixels = {
        x: event.pageX,
        y: event.pageY
      }
      var coords = Util.pixelsToCoords(pixels)
      self.sendCoords(coords)
    }
    $(document).on('mousemove.map', sendCoords)

    var zoom = function (event, e) {
      if (e) {
        var pixels = {
          x: e.pageX,
          y: e.pageY
        }
        var coords = Util.pixelsToCoords(pixels)
        self.sendCoords(coords)
      }
      self.positionPeerIcons()
    }
    $(document).on(JIT.events.zoom + '.map', zoom)

    $(document).on(JIT.events.pan + '.map', self.positionPeerIcons)

    var sendTopicDrag = function (event, positions) {
      self.sendTopicDrag(positions)
    }
    $(document).on(JIT.events.topicDrag + '.map', sendTopicDrag)

    var sendNewTopic = function (event, data) {
      self.sendNewTopic(data)
    }
    $(document).on(JIT.events.newTopic + '.map', sendNewTopic)

    var sendDeleteTopic = function (event, data) {
      self.sendDeleteTopic(data)
    }
    $(document).on(JIT.events.deleteTopic + '.map', sendDeleteTopic)

    var sendRemoveTopic = function (event, data) {
      self.sendRemoveTopic(data)
    }
    $(document).on(JIT.events.removeTopic + '.map', sendRemoveTopic)

    var sendNewSynapse = function (event, data) {
      self.sendNewSynapse(data)
    }
    $(document).on(JIT.events.newSynapse + '.map', sendNewSynapse)

    var sendDeleteSynapse = function (event, data) {
      self.sendDeleteSynapse(data)
    }
    $(document).on(JIT.events.deleteSynapse + '.map', sendDeleteSynapse)

    var sendRemoveSynapse = function (event, data) {
      self.sendRemoveSynapse(data)
    }
    $(document).on(JIT.events.removeSynapse + '.map', sendRemoveSynapse)

    var sendNewMessage = function (event, data) {
      self.sendNewMessage(data)
    }
    $(document).on(Views.Room.events.newMessage + '.map', sendNewMessage)
  },
  attachMapListener: function () {
    var self = Realtime
    var socket = Realtime.socket

    socket.on('mapChangeFromServer', self.mapChange)
  },
  sendRealtimeOn: function () {
    var self = Realtime
    var socket = Realtime.socket

    // send this new mapper back your details, and the awareness that you're online
    var update = {
      username: Active.Mapper.get('name'),
      userid: Active.Mapper.id,
      mapid: Active.Map.id
    }
    socket.emit('notifyStartRealtime', update)
  },
  sendRealtimeOff: function () {
    var self = Realtime
    var socket = Realtime.socket

    // send this new mapper back your details, and the awareness that you're online
    var update = {
      username: Active.Mapper.get('name'),
      userid: Active.Mapper.id,
      mapid: Active.Map.id
    }
    socket.emit('notifyStopRealtime', update)
  },
  updateMapperList: function (data) {
    var self = Realtime
    var socket = Realtime.socket

    // data.userid
    // data.username
    // data.userimage
    // data.userrealtime

    self.mappersOnMap[data.userid] = {
      id: data.userid,
      name: data.username,
      username: data.username,
      image: data.userimage,
      color: Util.getPastelColor(),
      realtime: data.userrealtime,
      inConversation: data.userinconversation,
      coords: {
        x: 0,
        y: 0
      }
    }

    if (data.userid !== Active.Mapper.id) {
      self.room.chat.addParticipant(self.mappersOnMap[data.userid])
      if (data.userinconversation) self.room.chat.mapperJoinedCall(data.userid)

      // create a div for the collaborators compass
      self.createCompass(data.username, data.userid, data.userimage, self.mappersOnMap[data.userid].color, !self.status)
    }
  },
  newPeerOnMap: function (data) {
    var self = Realtime
    var socket = Realtime.socket

    // data.userid
    // data.username
    // data.userimage
    // data.coords
    var firstOtherPerson = Object.keys(self.mappersOnMap).length === 0

    self.mappersOnMap[data.userid] = {
      id: data.userid,
      name: data.username,
      username: data.username,
      image: data.userimage,
      color: Util.getPastelColor(),
      realtime: true,
      coords: {
        x: 0,
        y: 0
      },
    }

    // create an item for them in the realtime box
    if (data.userid !== Active.Mapper.id && self.status) {
      self.room.chat.sound.play('joinmap')
      self.room.chat.addParticipant(self.mappersOnMap[data.userid])

      // create a div for the collaborators compass
      self.createCompass(data.username, data.userid, data.userimage, self.mappersOnMap[data.userid].color, !self.status)

      var notifyMessage = data.username + ' just joined the map'
      if (firstOtherPerson) {
        notifyMessage += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.inviteACall(' + data.userid + ')">Suggest A Video Call</button>'
      }
      GlobalUI.notifyUser(notifyMessage)

      // send this new mapper back your details, and the awareness that you've loaded the map
      var update = {
        userToNotify: data.userid,
        username: Active.Mapper.get('name'),
        userimage: Active.Mapper.get('image'),
        userid: Active.Mapper.id,
        userrealtime: self.status,
        userinconversation: self.inConversation,
        mapid: Active.Map.id
      }
      socket.emit('updateNewMapperList', update)
    }
  },
  createCompass: function (name, id, image, color, hide) {
    var str = '<img width="28" height="28" src="' + image + '" /><p>' + name + '</p>'
    str += '<div id="compassArrow' + id + '" class="compassArrow"></div>'
    $('#compass' + id).remove()
    $('<div/>', {
      id: 'compass' + id,
      class: 'collabCompass'
    }).html(str).appendTo('#wrapper')
    if (hide) {
      $('#compass' + id).hide()
    }
    $('#compass' + id + ' img').css({
      'border': '2px solid ' + color
    })
    $('#compass' + id + ' p').css({
      'background-color': color
    })
  },
  lostPeerOnMap: function (data) {
    var self = Realtime
    var socket = Realtime.socket

    // data.userid
    // data.username

    delete self.mappersOnMap[data.userid]
    self.room.chat.sound.play('leavemap')
    // $('#mapper' + data.userid).remove()
    $('#compass' + data.userid).remove()
    self.room.chat.removeParticipant(data.username)

    GlobalUI.notifyUser(data.username + ' just left the map')

    if ((self.inConversation && self.countOthersInConversation() === 0) ||
      (!self.inConversation && self.countOthersInConversation() === 1)) {
      self.callEnded()
    }
  },
  newCollaborator: function (data) {
    var self = Realtime
    var socket = Realtime.socket

    // data.userid
    // data.username

    self.mappersOnMap[data.userid].realtime = true

    // $('#mapper' + data.userid).removeClass('littleRtOff').addClass('littleRtOn')
    $('#compass' + data.userid).show()

    GlobalUI.notifyUser(data.username + ' just turned on realtime')
  },
  lostCollaborator: function (data) {
    var self = Realtime
    var socket = Realtime.socket

    // data.userid
    // data.username

    self.mappersOnMap[data.userid].realtime = false

    // $('#mapper' + data.userid).removeClass('littleRtOn').addClass('littleRtOff')
    $('#compass' + data.userid).hide()

    GlobalUI.notifyUser(data.username + ' just turned off realtime')
  },
  updatePeerCoords: function (data) {
    var self = Realtime
    var socket = Realtime.socket

    self.mappersOnMap[data.userid].coords = {x: data.usercoords.x,y: data.usercoords.y}
    self.positionPeerIcon(data.userid)
  },
  positionPeerIcons: function () {
    var self = Realtime
    var socket = Realtime.socket

    if (self.status) { // if i have realtime turned on
      for (var key in self.mappersOnMap) {
        var mapper = self.mappersOnMap[key]
        if (mapper.realtime) {
          self.positionPeerIcon(key)
        }
      }
    }
  },
  positionPeerIcon: function (id) {
    var self = Realtime
    var socket = Realtime.socket

    var boundary = self.chatOpen ? '#wrapper' : document
    var mapper = self.mappersOnMap[id]
    var xMax = $(boundary).width()
    var yMax = $(boundary).height()
    var compassDiameter = 56
    var compassArrowSize = 24

    var origPixels = Util.coordsToPixels(mapper.coords)
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
    var socket = Realtime.socket

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
  },
  sendCoords: function (coords) {
    var self = Realtime
    var socket = Realtime.socket

    var map = Active.Map
    var mapper = Active.Mapper

    if (self.status && map.authorizeToEdit(mapper) && socket) {
      var update = {
        usercoords: coords,
        userid: Active.Mapper.id,
        mapid: Active.Map.id
      }
      socket.emit('updateMapperCoords', update)
    }
  },
  sendTopicDrag: function (positions) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map && self.status) {
      positions.mapid = Active.Map.id
      socket.emit('topicDrag', positions)
    }
  },
  topicDrag: function (positions) {
    var self = Realtime
    var socket = self.socket

    var topic
    var node

    if (Active.Map && self.status) {
      for (var key in positions) {
        topic = Metamaps.Topics.get(key)
        if (topic) node = topic.get('node')
        if (node) node.pos.setc(positions[key].x, positions[key].y)
      } // for
      Visualize.mGraph.plot()
    }
  },
  sendTopicChange: function (topic) {
    var self = Realtime
    var socket = self.socket

    var data = {
      topicId: topic.id
    }

    socket.emit('topicChangeFromClient', data)
  },
  topicChange: function (data) {
    var topic = Metamaps.Topics.get(data.topicId)
    if (topic) {
      var node = topic.get('node')
      topic.fetch({
        success: function (model) {
          model.set({ node: node })
          model.trigger('changeByOther')
        }
      })
    }
  },
  sendSynapseChange: function (synapse) {
    var self = Realtime
    var socket = self.socket

    var data = {
      synapseId: synapse.id
    }

    socket.emit('synapseChangeFromClient', data)
  },
  synapseChange: function (data) {
    var synapse = Metamaps.Synapses.get(data.synapseId)
    if (synapse) {
      // edge reset necessary because fetch causes model reset
      var edge = synapse.get('edge')
      synapse.fetch({
        success: function (model) {
          model.set({ edge: edge })
          model.trigger('changeByOther')
        }
      })
    }
  },
  sendMapChange: function (map) {
    var self = Realtime
    var socket = self.socket

    var data = {
      mapId: map.id
    }

    socket.emit('mapChangeFromClient', data)
  },
  mapChange: function (data) {
    var map = Active.Map
    var isActiveMap = map && data.mapId === map.id
    if (isActiveMap) {
      var couldEditBefore = map.authorizeToEdit(Active.Mapper)
      var idBefore = map.id
      map.fetch({
        success: function (model, response) {
          var idNow = model.id
          var canEditNow = model.authorizeToEdit(Active.Mapper)
          if (idNow !== idBefore) {
            Map.leavePrivateMap() // this means the map has been changed to private
          }
          else if (couldEditBefore && !canEditNow) {
            Map.cantEditNow()
          }
          else if (!couldEditBefore && canEditNow) {
            Map.canEditNow()
          } else {
            model.trigger('changeByOther')
          }
        }
      })
    }
  },
  // newMessage
  sendNewMessage: function (data) {
    var self = Realtime
    var socket = self.socket

    var message = data.attributes
    message.mapid = Active.Map.id
    socket.emit('newMessage', message)
  },
  newMessage: function (data) {
    var self = Realtime
    var socket = self.socket

    self.room.addMessages(new Metamaps.Backbone.MessageCollection(data))
  },
  // newTopic
  sendNewTopic: function (data) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map && self.status) {
      data.mapperid = Active.Mapper.id
      data.mapid = Active.Map.id
      socket.emit('newTopic', data)
    }
  },
  newTopic: function (data) {
    var topic, mapping, mapper, cancel

    var self = Realtime
    var socket = self.socket

    if (!self.status) return

    function waitThenRenderTopic () {
      if (topic && mapping && mapper) {
        Topic.renderTopic(mapping, topic, false, false)
      }
      else if (!cancel) {
        setTimeout(waitThenRenderTopic, 10)
      }
    }

    mapper = Metamaps.Mappers.get(data.mapperid)
    if (mapper === undefined) {
      Mapper.get(data.mapperid, function(m) {
        Metamaps.Mappers.add(m)
        mapper = m
      })
    }
    $.ajax({
      url: '/topics/' + data.mappableid + '.json',
      success: function (response) {
        Metamaps.Topics.add(response)
        topic = Metamaps.Topics.get(response.id)
      },
      error: function () {
        cancel = true
      }
    })
    $.ajax({
      url: '/mappings/' + data.mappingid + '.json',
      success: function (response) {
        Metamaps.Mappings.add(response)
        mapping = Metamaps.Mappings.get(response.id)
      },
      error: function () {
        cancel = true
      }
    })

    waitThenRenderTopic()
  },
  // removeTopic
  sendDeleteTopic: function (data) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map) {
      socket.emit('deleteTopicFromClient', data)
    }
  },
  // removeTopic
  sendRemoveTopic: function (data) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map) {
      data.mapid = Active.Map.id
      socket.emit('removeTopic', data)
    }
  },
  removeTopic: function (data) {
    var self = Realtime
    var socket = self.socket

    if (!self.status) return

    var topic = Metamaps.Topics.get(data.mappableid)
    if (topic) {
      var node = topic.get('node')
      var mapping = topic.getMapping()
      Control.hideNode(node.id)
      Metamaps.Topics.remove(topic)
      Metamaps.Mappings.remove(mapping)
    }
  },
  // newSynapse
  sendNewSynapse: function (data) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map) {
      data.mapperid = Active.Mapper.id
      data.mapid = Active.Map.id
      socket.emit('newSynapse', data)
    }
  },
  newSynapse: function (data) {
    var topic1, topic2, node1, node2, synapse, mapping, cancel, mapper

    var self = Realtime
    var socket = self.socket

    if (!self.status) return

    function waitThenRenderSynapse () {
      if (synapse && mapping && mapper) {
        topic1 = synapse.getTopic1()
        node1 = topic1.get('node')
        topic2 = synapse.getTopic2()
        node2 = topic2.get('node')

        Synapse.renderSynapse(mapping, synapse, node1, node2, false)
      }
      else if (!cancel) {
        setTimeout(waitThenRenderSynapse, 10)
      }
    }

    mapper = Metamaps.Mappers.get(data.mapperid)
    if (mapper === undefined) {
      Mapper.get(data.mapperid, function(m) {
        Metamaps.Mappers.add(m)
        mapper = m
      })
    }
    $.ajax({
      url: '/synapses/' + data.mappableid + '.json',
      success: function (response) {
        Metamaps.Synapses.add(response)
        synapse = Metamaps.Synapses.get(response.id)
      },
      error: function () {
        cancel = true
      }
    })
    $.ajax({
      url: '/mappings/' + data.mappingid + '.json',
      success: function (response) {
        Metamaps.Mappings.add(response)
        mapping = Metamaps.Mappings.get(response.id)
      },
      error: function () {
        cancel = true
      }
    })
    waitThenRenderSynapse()
  },
  // deleteSynapse
  sendDeleteSynapse: function (data) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map) {
      data.mapid = Active.Map.id
      socket.emit('deleteSynapseFromClient', data)
    }
  },
  // removeSynapse
  sendRemoveSynapse: function (data) {
    var self = Realtime
    var socket = self.socket

    if (Active.Map) {
      data.mapid = Active.Map.id
      socket.emit('removeSynapse', data)
    }
  },
  removeSynapse: function (data) {
    var self = Realtime
    var socket = self.socket

    if (!self.status) return

    var synapse = Metamaps.Synapses.get(data.mappableid)
    if (synapse) {
      var edge = synapse.get('edge')
      var mapping = synapse.getMapping()
      if (edge.getData('mappings').length - 1 === 0) {
        Control.hideEdge(edge)
      }

      var index = _.indexOf(edge.getData('synapses'), synapse)
      edge.getData('mappings').splice(index, 1)
      edge.getData('synapses').splice(index, 1)
      if (edge.getData('displayIndex')) {
        delete edge.data.$displayIndex
      }
      Metamaps.Synapses.remove(synapse)
      Metamaps.Mappings.remove(mapping)
    }
  },
}

export default Realtime
