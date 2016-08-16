/* global Metamaps, $ */

/*
 * Metamaps.Realtime.js
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Backbone
 *  - Metamaps.Backbone
 *  - Metamaps.Control
 *  - Metamaps.Erb
 *  - Metamaps.GlobalUI
 *  - Metamaps.JIT
 *  - Metamaps.Map
 *  - Metamaps.Mapper
 *  - Metamaps.Mappers
 *  - Metamaps.Mappings
 *  - Metamaps.Messages
 *  - Metamaps.Synapses
 *  - Metamaps.Topic
 *  - Metamaps.Topics
 *  - Metamaps.Util
 *  - Metamaps.Views
 *  - Metamaps.Visualize
 */

Metamaps.Realtime = {
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
    var self = Metamaps.Realtime

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

    if (Metamaps.Active.Mapper) {
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
        nick: Metamaps.Active.Mapper.id
      })

      var $video = $('<video></video>').attr('id', self.videoId)
      self.localVideo = {
        $video: $video,
        view: new Metamaps.Views.videoView($video[0], $('body'), 'me', true, {
          DOUBLE_CLICK_TOLERANCE: 200,
          avatar: Metamaps.Active.Mapper ? Metamaps.Active.Mapper.get('image') : ''
        })
      }

      self.room = new Metamaps.Views.room({
        webrtc: self.webrtc,
        socket: self.socket,
        username: Metamaps.Active.Mapper ? Metamaps.Active.Mapper.get('name') : '',
        image: Metamaps.Active.Mapper ? Metamaps.Active.Mapper.get('image') : '',
        room: 'global',
        $video: self.localVideo.$video,
        myVideoView: self.localVideo.view,
        config: { DOUBLE_CLICK_TOLERANCE: 200 }
      })
      self.room.videoAdded(self.handleVideoAdded)

      if (!Metamaps.Active.Map) {
        self.room.chat.$container.hide()
      }
      $('body').prepend(self.room.chat.$container)
    } // if Metamaps.Active.Mapper
  },
  addJuntoListeners: function () {
    var self = Metamaps.Realtime

    $(document).on(Metamaps.Views.chatView.events.openTray, function () {
      $('.main').addClass('compressed')
      self.chatOpen = true
      self.positionPeerIcons()
    })
    $(document).on(Metamaps.Views.chatView.events.closeTray, function () {
      $('.main').removeClass('compressed')
      self.chatOpen = false
      self.positionPeerIcons()
    })
    $(document).on(Metamaps.Views.chatView.events.videosOn, function () {
      $('#wrapper').removeClass('hideVideos')
    })
    $(document).on(Metamaps.Views.chatView.events.videosOff, function () {
      $('#wrapper').addClass('hideVideos')
    })
    $(document).on(Metamaps.Views.chatView.events.cursorsOn, function () {
      $('#wrapper').removeClass('hideCursors')
    })
    $(document).on(Metamaps.Views.chatView.events.cursorsOff, function () {
      $('#wrapper').addClass('hideCursors')
    })
  },
  handleVideoAdded: function (v, id) {
    var self = Metamaps.Realtime
    self.positionVideos()
    v.setParent($('#wrapper'))
    v.$container.find('.video-cutoff').css({
      border: '4px solid ' + self.mappersOnMap[id].color
    })
    $('#wrapper').append(v.$container)
  },
  positionVideos: function () {
    var self = Metamaps.Realtime
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
    var myVideo = Metamaps.Realtime.localVideo.view
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
    var self = Metamaps.Realtime

    if (Metamaps.Active.Map && Metamaps.Active.Mapper) {
      if (Metamaps.Active.Map.authorizeToEdit(Metamaps.Active.Mapper)) {
        self.turnOn()
        self.setupSocket()
      } else {
        self.attachMapListener()
      }
      self.room.addMessages(new Metamaps.Backbone.MessageCollection(Metamaps.Messages), true)
    }
  },
  endActiveMap: function () {
    var self = Metamaps.Realtime

    $(document).off('mousemove')
    self.socket.removeAllListeners()
    if (self.inConversation) self.leaveCall()
    self.socket.emit('endMapperNotify')
    $('.collabCompass').remove()
    self.status = false
    self.room.leave()
    self.room.chat.$container.hide()
    self.room.chat.close()
  },
  turnOn: function (notify) {
    var self = Metamaps.Realtime

    if (notify) self.sendRealtimeOn()
    self.status = true
    $('.collabCompass').show()
    self.room.chat.$container.show()
    self.room.room = 'map-' + Metamaps.Active.Map.id
    self.checkForACallToJoin()

    self.activeMapper = {
      id: Metamaps.Active.Mapper.id,
      name: Metamaps.Active.Mapper.get('name'),
      username: Metamaps.Active.Mapper.get('name'),
      image: Metamaps.Active.Mapper.get('image'),
      color: Metamaps.Util.getPastelColor(),
      self: true
    }
    self.localVideo.view.$container.find('.video-cutoff').css({
      border: '4px solid ' + self.activeMapper.color
    })
    self.room.chat.addParticipant(self.activeMapper)
  },
  checkForACallToJoin: function () {
    var self = Metamaps.Realtime
    self.socket.emit('checkForCall', { room: self.room.room, mapid: Metamaps.Active.Map.id })
  },
  promptToJoin: function () {
    var self = Metamaps.Realtime

    var notifyText = "There's a conversation happening, want to join?"
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.GlobalUI.clearNotify()">No</button>'
    Metamaps.GlobalUI.notifyUser(notifyText, true)
    self.room.conversationInProgress()
  },
  conversationHasBegun: function () {
    var self = Metamaps.Realtime

    if (self.inConversation) return
    var notifyText = "There's a conversation starting, want to join?"
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.GlobalUI.clearNotify()">No</button>'
    Metamaps.GlobalUI.notifyUser(notifyText, true)
    self.room.conversationInProgress()
  },
  countOthersInConversation: function () {
    var self = Metamaps.Realtime
    var count = 0

    for (var key in self.mappersOnMap) {
      if (self.mappersOnMap[key].inConversation) count++
    }
    return count
  },
  mapperJoinedCall: function (id) {
    var self = Metamaps.Realtime
    var mapper = self.mappersOnMap[id]

    if (mapper) {
      if (self.inConversation) {
        var username = mapper.name
        var notifyText = username + ' joined the call'
        Metamaps.GlobalUI.notifyUser(notifyText)
      }

      mapper.inConversation = true
      self.room.chat.mapperJoinedCall(id)
    }
  },
  mapperLeftCall: function (id) {
    var self = Metamaps.Realtime
    var mapper = self.mappersOnMap[id]

    if (mapper) {
      if (self.inConversation) {
        var username = mapper.name
        var notifyText = username + ' left the call'
        Metamaps.GlobalUI.notifyUser(notifyText)
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
    var self = Metamaps.Realtime

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
    var self = Metamaps.Realtime

    self.room.chat.sound.stop('sessioninvite')
    self.room.chat.sound.play('sessioninvite')

    var username = self.mappersOnMap[inviter].name
    var notifyText = '<img src="' + Metamaps.Erb['junto_spinner_darkgrey.gif'] + '" style="display: inline-block; margin-top: -12px; vertical-align: top;" />'
    notifyText += username + ' is inviting you to a conversation. Join live?'
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.acceptCall(' + inviter + ')">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.Realtime.denyCall(' + inviter + ')">No</button>'
    Metamaps.GlobalUI.notifyUser(notifyText, true)
  },
  invitedToJoin: function (inviter) {
    var self = Metamaps.Realtime

    self.room.chat.sound.stop('sessioninvite')
    self.room.chat.sound.play('sessioninvite')

    var username = self.mappersOnMap[inviter].name
    var notifyText = username + ' is inviting you to the conversation. Join?'
    notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
    notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.Realtime.denyInvite(' + inviter + ')">No</button>'
    Metamaps.GlobalUI.notifyUser(notifyText, true)
  },
  acceptCall: function (userid) {
    var self = Metamaps.Realtime
    self.room.chat.sound.stop('sessioninvite')
    self.socket.emit('callAccepted', {
      mapid: Metamaps.Active.Map.id,
      invited: Metamaps.Active.Mapper.id,
      inviter: userid
    })
    $.post('/maps/' + Metamaps.Active.Map.id + '/events/conversation')
    self.joinCall()
    Metamaps.GlobalUI.clearNotify()
  },
  denyCall: function (userid) {
    var self = Metamaps.Realtime
    self.room.chat.sound.stop('sessioninvite')
    self.socket.emit('callDenied', {
      mapid: Metamaps.Active.Map.id,
      invited: Metamaps.Active.Mapper.id,
      inviter: userid
    })
    Metamaps.GlobalUI.clearNotify()
  },
  denyInvite: function (userid) {
    var self = Metamaps.Realtime
    self.room.chat.sound.stop('sessioninvite')
    self.socket.emit('inviteDenied', {
      mapid: Metamaps.Active.Map.id,
      invited: Metamaps.Active.Mapper.id,
      inviter: userid
    })
    Metamaps.GlobalUI.clearNotify()
  },
  inviteACall: function (userid) {
    var self = Metamaps.Realtime
    self.socket.emit('inviteACall', {
      mapid: Metamaps.Active.Map.id,
      inviter: Metamaps.Active.Mapper.id,
      invited: userid
    })
    self.room.chat.invitationPending(userid)
    Metamaps.GlobalUI.clearNotify()
  },
  inviteToJoin: function (userid) {
    var self = Metamaps.Realtime
    self.socket.emit('inviteToJoin', {
      mapid: Metamaps.Active.Map.id,
      inviter: Metamaps.Active.Mapper.id,
      invited: userid
    })
    self.room.chat.invitationPending(userid)
  },
  callAccepted: function (userid) {
    var self = Metamaps.Realtime

    var username = self.mappersOnMap[userid].name
    Metamaps.GlobalUI.notifyUser('Conversation starting...')
    self.joinCall()
    self.room.chat.invitationAnswered(userid)
  },
  callDenied: function (userid) {
    var self = Metamaps.Realtime

    var username = self.mappersOnMap[userid].name
    Metamaps.GlobalUI.notifyUser(username + " didn't accept your invitation")
    self.room.chat.invitationAnswered(userid)
  },
  inviteDenied: function (userid) {
    var self = Metamaps.Realtime

    var username = self.mappersOnMap[userid].name
    Metamaps.GlobalUI.notifyUser(username + " didn't accept your invitation")
    self.room.chat.invitationAnswered(userid)
  },
  joinCall: function () {
    var self = Metamaps.Realtime

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
      mapid: Metamaps.Active.Map.id,
      id: Metamaps.Active.Mapper.id
    })
    self.webrtc.startLocalVideo()
    Metamaps.GlobalUI.clearNotify()
    self.room.chat.mapperJoinedCall(Metamaps.Active.Mapper.id)
  },
  leaveCall: function () {
    var self = Metamaps.Realtime

    self.socket.emit('mapperLeftCall', {
      mapid: Metamaps.Active.Map.id,
      id: Metamaps.Active.Mapper.id
    })

    self.room.chat.mapperLeftCall(Metamaps.Active.Mapper.id)
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
    var self = Metamaps.Realtime

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
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket
    var myId = Metamaps.Active.Mapper.id

    socket.emit('newMapperNotify', {
      userid: myId,
      username: Metamaps.Active.Mapper.get('name'),
      userimage: Metamaps.Active.Mapper.get('image'),
      mapid: Metamaps.Active.Map.id
    })

    socket.on(myId + '-' + Metamaps.Active.Map.id + '-invitedToCall', self.invitedToCall) // new call
    socket.on(myId + '-' + Metamaps.Active.Map.id + '-invitedToJoin', self.invitedToJoin) // call already in progress
    socket.on(myId + '-' + Metamaps.Active.Map.id + '-callAccepted', self.callAccepted)
    socket.on(myId + '-' + Metamaps.Active.Map.id + '-callDenied', self.callDenied)
    socket.on(myId + '-' + Metamaps.Active.Map.id + '-inviteDenied', self.inviteDenied)

    // receive word that there's a conversation in progress
    socket.on('maps-' + Metamaps.Active.Map.id + '-callInProgress', self.promptToJoin)
    socket.on('maps-' + Metamaps.Active.Map.id + '-callStarting', self.conversationHasBegun)

    socket.on('maps-' + Metamaps.Active.Map.id + '-mapperJoinedCall', self.mapperJoinedCall)
    socket.on('maps-' + Metamaps.Active.Map.id + '-mapperLeftCall', self.mapperLeftCall)

    // if you're the 'new guy' update your list with who's already online
    socket.on(myId + '-' + Metamaps.Active.Map.id + '-UpdateMapperList', self.updateMapperList)

    // receive word that there's a new mapper on the map
    socket.on('maps-' + Metamaps.Active.Map.id + '-newmapper', self.newPeerOnMap)

    // receive word that a mapper left the map
    socket.on('maps-' + Metamaps.Active.Map.id + '-lostmapper', self.lostPeerOnMap)

    // receive word that there's a mapper turned on realtime
    socket.on('maps-' + Metamaps.Active.Map.id + '-newrealtime', self.newCollaborator)

    // receive word that there's a mapper turned on realtime
    socket.on('maps-' + Metamaps.Active.Map.id + '-lostrealtime', self.lostCollaborator)

    //
    socket.on('maps-' + Metamaps.Active.Map.id + '-topicDrag', self.topicDrag)

    //
    socket.on('maps-' + Metamaps.Active.Map.id + '-newTopic', self.newTopic)

    //
    socket.on('maps-' + Metamaps.Active.Map.id + '-newMessage', self.newMessage)

    //
    socket.on('maps-' + Metamaps.Active.Map.id + '-removeTopic', self.removeTopic)

    //
    socket.on('maps-' + Metamaps.Active.Map.id + '-newSynapse', self.newSynapse)

    //
    socket.on('maps-' + Metamaps.Active.Map.id + '-removeSynapse', self.removeSynapse)

    // update mapper compass position
    socket.on('maps-' + Metamaps.Active.Map.id + '-updatePeerCoords', self.updatePeerCoords)

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
      var coords = Metamaps.Util.pixelsToCoords(pixels)
      self.sendCoords(coords)
    }
    $(document).mousemove(sendCoords)

    var zoom = function (event, e) {
      if (e) {
        var pixels = {
          x: e.pageX,
          y: e.pageY
        }
        var coords = Metamaps.Util.pixelsToCoords(pixels)
        self.sendCoords(coords)
      }
      self.positionPeerIcons()
    }
    $(document).on(Metamaps.JIT.events.zoom, zoom)

    $(document).on(Metamaps.JIT.events.pan, self.positionPeerIcons)

    var sendTopicDrag = function (event, positions) {
      self.sendTopicDrag(positions)
    }
    $(document).on(Metamaps.JIT.events.topicDrag, sendTopicDrag)

    var sendNewTopic = function (event, data) {
      self.sendNewTopic(data)
    }
    $(document).on(Metamaps.JIT.events.newTopic, sendNewTopic)

    var sendDeleteTopic = function (event, data) {
      self.sendDeleteTopic(data)
    }
    $(document).on(Metamaps.JIT.events.deleteTopic, sendDeleteTopic)

    var sendRemoveTopic = function (event, data) {
      self.sendRemoveTopic(data)
    }
    $(document).on(Metamaps.JIT.events.removeTopic, sendRemoveTopic)

    var sendNewSynapse = function (event, data) {
      self.sendNewSynapse(data)
    }
    $(document).on(Metamaps.JIT.events.newSynapse, sendNewSynapse)

    var sendDeleteSynapse = function (event, data) {
      self.sendDeleteSynapse(data)
    }
    $(document).on(Metamaps.JIT.events.deleteSynapse, sendDeleteSynapse)

    var sendRemoveSynapse = function (event, data) {
      self.sendRemoveSynapse(data)
    }
    $(document).on(Metamaps.JIT.events.removeSynapse, sendRemoveSynapse)

    var sendNewMessage = function (event, data) {
      self.sendNewMessage(data)
    }
    $(document).on(Metamaps.Views.room.events.newMessage, sendNewMessage)
  },
  attachMapListener: function () {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    socket.on('mapChangeFromServer', self.mapChange)
  },
  sendRealtimeOn: function () {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    // send this new mapper back your details, and the awareness that you're online
    var update = {
      username: Metamaps.Active.Mapper.get('name'),
      userid: Metamaps.Active.Mapper.id,
      mapid: Metamaps.Active.Map.id
    }
    socket.emit('notifyStartRealtime', update)
  },
  sendRealtimeOff: function () {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    // send this new mapper back your details, and the awareness that you're online
    var update = {
      username: Metamaps.Active.Mapper.get('name'),
      userid: Metamaps.Active.Mapper.id,
      mapid: Metamaps.Active.Map.id
    }
    socket.emit('notifyStopRealtime', update)
  },
  updateMapperList: function (data) {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    // data.userid
    // data.username
    // data.userimage
    // data.userrealtime

    self.mappersOnMap[data.userid] = {
      id: data.userid,
      name: data.username,
      username: data.username,
      image: data.userimage,
      color: Metamaps.Util.getPastelColor(),
      realtime: data.userrealtime,
      inConversation: data.userinconversation,
      coords: {
        x: 0,
        y: 0
      }
    }

    if (data.userid !== Metamaps.Active.Mapper.id) {
      self.room.chat.addParticipant(self.mappersOnMap[data.userid])
      if (data.userinconversation) self.room.chat.mapperJoinedCall(data.userid)

      // create a div for the collaborators compass
      self.createCompass(data.username, data.userid, data.userimage, self.mappersOnMap[data.userid].color, !self.status)
    }
  },
  newPeerOnMap: function (data) {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

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
      color: Metamaps.Util.getPastelColor(),
      realtime: true,
      coords: {
        x: 0,
        y: 0
      },
    }

    // create an item for them in the realtime box
    if (data.userid !== Metamaps.Active.Mapper.id && self.status) {
      self.room.chat.sound.play('joinmap')
      self.room.chat.addParticipant(self.mappersOnMap[data.userid])

      // create a div for the collaborators compass
      self.createCompass(data.username, data.userid, data.userimage, self.mappersOnMap[data.userid].color, !self.status)

      var notifyMessage = data.username + ' just joined the map'
      if (firstOtherPerson) {
        notifyMessage += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.inviteACall(' + data.userid + ')">Suggest A Video Call</button>'
      }
      Metamaps.GlobalUI.notifyUser(notifyMessage)

      // send this new mapper back your details, and the awareness that you've loaded the map
      var update = {
        userToNotify: data.userid,
        username: Metamaps.Active.Mapper.get('name'),
        userimage: Metamaps.Active.Mapper.get('image'),
        userid: Metamaps.Active.Mapper.id,
        userrealtime: self.status,
        userinconversation: self.inConversation,
        mapid: Metamaps.Active.Map.id
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
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    // data.userid
    // data.username

    delete self.mappersOnMap[data.userid]
    self.room.chat.sound.play('leavemap')
    // $('#mapper' + data.userid).remove()
    $('#compass' + data.userid).remove()
    self.room.chat.removeParticipant(data.username)

    Metamaps.GlobalUI.notifyUser(data.username + ' just left the map')

    if ((self.inConversation && self.countOthersInConversation() === 0) ||
      (!self.inConversation && self.countOthersInConversation() === 1)) {
      self.callEnded()
    }
  },
  newCollaborator: function (data) {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    // data.userid
    // data.username

    self.mappersOnMap[data.userid].realtime = true

    // $('#mapper' + data.userid).removeClass('littleRtOff').addClass('littleRtOn')
    $('#compass' + data.userid).show()

    Metamaps.GlobalUI.notifyUser(data.username + ' just turned on realtime')
  },
  lostCollaborator: function (data) {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    // data.userid
    // data.username

    self.mappersOnMap[data.userid].realtime = false

    // $('#mapper' + data.userid).removeClass('littleRtOn').addClass('littleRtOff')
    $('#compass' + data.userid).hide()

    Metamaps.GlobalUI.notifyUser(data.username + ' just turned off realtime')
  },
  updatePeerCoords: function (data) {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    self.mappersOnMap[data.userid].coords = {x: data.usercoords.x,y: data.usercoords.y}
    self.positionPeerIcon(data.userid)
  },
  positionPeerIcons: function () {
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

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
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    var boundary = self.chatOpen ? '#wrapper' : document
    var mapper = self.mappersOnMap[id]
    var xMax = $(boundary).width()
    var yMax = $(boundary).height()
    var compassDiameter = 56
    var compassArrowSize = 24

    var origPixels = Metamaps.Util.coordsToPixels(mapper.coords)
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
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

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
    var self = Metamaps.Realtime
    var socket = Metamaps.Realtime.socket

    var map = Metamaps.Active.Map
    var mapper = Metamaps.Active.Mapper

    if (self.status && map.authorizeToEdit(mapper) && socket) {
      var update = {
        usercoords: coords,
        userid: Metamaps.Active.Mapper.id,
        mapid: Metamaps.Active.Map.id
      }
      socket.emit('updateMapperCoords', update)
    }
  },
  sendTopicDrag: function (positions) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map && self.status) {
      positions.mapid = Metamaps.Active.Map.id
      socket.emit('topicDrag', positions)
    }
  },
  topicDrag: function (positions) {
    var self = Metamaps.Realtime
    var socket = self.socket

    var topic
    var node

    if (Metamaps.Active.Map && self.status) {
      for (var key in positions) {
        topic = Metamaps.Topics.get(key)
        if (topic) node = topic.get('node')
        if (node) node.pos.setc(positions[key].x, positions[key].y)
      } // for
      Metamaps.Visualize.mGraph.plot()
    }
  },
  sendTopicChange: function (topic) {
    var self = Metamaps.Realtime
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
    var self = Metamaps.Realtime
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
    var self = Metamaps.Realtime
    var socket = self.socket

    var data = {
      mapId: map.id
    }

    socket.emit('mapChangeFromClient', data)
  },
  mapChange: function (data) {
    var map = Metamaps.Active.Map
    var isActiveMap = map && data.mapId === map.id
    if (isActiveMap) {
      var couldEditBefore = map.authorizeToEdit(Metamaps.Active.Mapper)
      var idBefore = map.id
      map.fetch({
        success: function (model, response) {
          var idNow = model.id
          var canEditNow = model.authorizeToEdit(Metamaps.Active.Mapper)
          if (idNow !== idBefore) {
            Metamaps.Map.leavePrivateMap() // this means the map has been changed to private
          }
          else if (couldEditBefore && !canEditNow) {
            Metamaps.Map.cantEditNow()
          }
          else if (!couldEditBefore && canEditNow) {
            Metamaps.Map.canEditNow()
          } else {
            model.fetchContained()
            model.trigger('changeByOther')
          }
        }
      })
    }
  },
  // newMessage
  sendNewMessage: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    var message = data.attributes
    message.mapid = Metamaps.Active.Map.id
    socket.emit('newMessage', message)
  },
  newMessage: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    self.room.addMessages(new Metamaps.Backbone.MessageCollection(data))
  },
  // newTopic
  sendNewTopic: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map && self.status) {
      data.mapperid = Metamaps.Active.Mapper.id
      data.mapid = Metamaps.Active.Map.id
      socket.emit('newTopic', data)
    }
  },
  newTopic: function (data) {
    var topic, mapping, mapper, mapperCallback, cancel

    var self = Metamaps.Realtime
    var socket = self.socket

    if (!self.status) return

    function waitThenRenderTopic () {
      if (topic && mapping && mapper) {
        Metamaps.Topic.renderTopic(mapping, topic, false, false)
      }
      else if (!cancel) {
        setTimeout(waitThenRenderTopic, 10)
      }
    }

    mapper = Metamaps.Mappers.get(data.mapperid)
    if (mapper === undefined) {
      mapperCallback = function (m) {
        Metamaps.Mappers.add(m)
        mapper = m
      }
      Metamaps.Mapper.get(data.mapperid, mapperCallback)
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
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map) {
      socket.emit('deleteTopicFromClient', data)
    }
  },
  // removeTopic
  sendRemoveTopic: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map) {
      data.mapid = Metamaps.Active.Map.id
      socket.emit('removeTopic', data)
    }
  },
  removeTopic: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (!self.status) return

    var topic = Metamaps.Topics.get(data.mappableid)
    if (topic) {
      var node = topic.get('node')
      var mapping = topic.getMapping()
      Metamaps.Control.hideNode(node.id)
      Metamaps.Topics.remove(topic)
      Metamaps.Mappings.remove(mapping)
    }
  },
  // newSynapse
  sendNewSynapse: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map) {
      data.mapperid = Metamaps.Active.Mapper.id
      data.mapid = Metamaps.Active.Map.id
      socket.emit('newSynapse', data)
    }
  },
  newSynapse: function (data) {
    var topic1, topic2, node1, node2, synapse, mapping, cancel

    var self = Metamaps.Realtime
    var socket = self.socket

    if (!self.status) return

    function waitThenRenderSynapse () {
      if (synapse && mapping && mapper) {
        topic1 = synapse.getTopic1()
        node1 = topic1.get('node')
        topic2 = synapse.getTopic2()
        node2 = topic2.get('node')

        Metamaps.Synapse.renderSynapse(mapping, synapse, node1, node2, false)
      }
      else if (!cancel) {
        setTimeout(waitThenRenderSynapse, 10)
      }
    }

    mapper = Metamaps.Mappers.get(data.mapperid)
    if (mapper === undefined) {
      mapperCallback = function (m) {
        Metamaps.Mappers.add(m)
        mapper = m
      }
      Metamaps.Mapper.get(data.mapperid, mapperCallback)
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
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map) {
      data.mapid = Metamaps.Active.Map.id
      socket.emit('deleteSynapseFromClient', data)
    }
  },
  // removeSynapse
  sendRemoveSynapse: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (Metamaps.Active.Map) {
      data.mapid = Metamaps.Active.Map.id
      socket.emit('removeSynapse', data)
    }
  },
  removeSynapse: function (data) {
    var self = Metamaps.Realtime
    var socket = self.socket

    if (!self.status) return

    var synapse = Metamaps.Synapses.get(data.mappableid)
    if (synapse) {
      var edge = synapse.get('edge')
      var mapping = synapse.getMapping()
      if (edge.getData('mappings').length - 1 === 0) {
        Metamaps.Control.hideEdge(edge)
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
}; // end Metamaps.Realtime
