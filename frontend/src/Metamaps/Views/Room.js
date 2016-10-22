/* global Metamaps, $ */

import Backbone from 'backbone'
import attachMediaStream from 'attachmediastream'

// TODO is this line good or bad
// Backbone.$ = window.$

import Active from '../Active'
import Realtime from '../Realtime'

import ChatView from './ChatView'
import VideoView from './VideoView'

/*
 * Dependencies:
 *   Metamaps.Backbone
 */

const Room = function(opts) {
  var self = this

  this.isActiveRoom = false
  this.socket = opts.socket
  this.webrtc = opts.webrtc
  this.room = opts.room
  this.config = opts.config
  this.peopleCount = 0

  this.$myVideo = opts.$video
  this.myVideo = opts.myVideoView

  this.messages = new Backbone.Collection()
  this.currentMapper = new Backbone.Model({ name: opts.username, image: opts.image })
  this.chat = new ChatView(this.messages, this.currentMapper, this.room)

  this.videos = {}

  this.init()
}

Room.prototype.join = function(cb) {
  this.isActiveRoom = true
  this.webrtc.joinRoom(this.room, cb)
  this.chat.conversationInProgress(true) // true indicates participation
}

Room.prototype.conversationInProgress = function() {
  this.chat.conversationInProgress(false) // false indicates not participating
}

Room.prototype.conversationEnding = function() {
  this.chat.conversationEnded()
}

Room.prototype.leaveVideoOnly = function() {
  this.chat.leaveConversation() // the conversation will carry on without you
  for (var id in this.videos) {
    this.removeVideo(id)
  }
  this.isActiveRoom = false
  this.webrtc.leaveRoom()
  this.webrtc.stopLocalVideo()
}

Room.prototype.leave = function() {
  for (var id in this.videos) {
    this.removeVideo(id)
  }
  this.isActiveRoom = false
  this.webrtc.leaveRoom()
  this.webrtc.stopLocalVideo()
  this.chat.conversationEnded()
  this.chat.removeParticipants()
  this.chat.clearMessages()
  this.messages.reset()
}

Room.prototype.setPeopleCount = function(count) {
  this.peopleCount = count
}

Room.prototype.init = function () {
    var self = this

    $(document).on(VideoView.events.audioControlClick, function (event, videoView) {
      if (!videoView.audioStatus) self.webrtc.mute()
      else if (videoView.audioStatus) self.webrtc.unmute()
    })
    $(document).on(VideoView.events.videoControlClick, function (event, videoView) {
      if (!videoView.videoStatus) self.webrtc.pauseVideo()
      else if (videoView.videoStatus) self.webrtc.resumeVideo()
    })

    this.webrtc.webrtc.off('peerStreamAdded')
    this.webrtc.webrtc.off('peerStreamRemoved')
    this.webrtc.on('peerStreamAdded', function (peer) {
      var mapper = Realtime.mappersOnMap[peer.nick]
      peer.avatar = mapper.image
      peer.username = mapper.name
      if (self.isActiveRoom) {
          self.addVideo(peer)
      }
    })

    this.webrtc.on('peerStreamRemoved', function (peer) {
      if (self.isActiveRoom) {
          self.removeVideo(peer)
      }
    })

    this.webrtc.on('mute', function (data) {
      var v = self.videos[data.id]
      if (!v) return

      if (data.name === 'audio') {
        v.audioStatus = false
      }
      else if (data.name === 'video') {
        v.videoStatus = false
        v.$avatar.show()
      }
      if (!v.audioStatus && !v.videoStatus) v.$container.hide()
    })
    this.webrtc.on('unmute', function (data) {
      var v = self.videos[data.id]
      if (!v) return

      if (data.name === 'audio') {
        v.audioStatus = true
      }
      else if (data.name === 'video') {
        v.videoStatus = true
        v.$avatar.hide()
      }
      v.$container.show()
    })

    var sendChatMessage = function (event, data) {
      self.sendChatMessage(data)
    }
    $(document).on(ChatView.events.message + '-' + this.room, sendChatMessage)
  }

  Room.prototype.videoAdded = function (callback) {
      this._videoAdded = callback
  }

  Room.prototype.addVideo = function (peer) {
    var
      id = this.webrtc.getDomId(peer),
      video = attachMediaStream(peer.stream)

    var
      v = new VideoView(video, null, id, false, { DOUBLE_CLICK_TOLERANCE: 200, avatar: peer.avatar, username: peer.username })

    this.videos[peer.id] = v
    if (this._videoAdded) this._videoAdded(v, peer.nick)
  }

  Room.prototype.removeVideo = function (peer) {
      var id = typeof peer == 'string' ? peer : peer.id
      if (this.videos[id]) {
        this.videos[id].remove()
        delete this.videos[id]
      }
  }

  Room.prototype.sendChatMessage = function (data) {
    var self = this
      //this.roomRef.child('messages').push(data)
      if (self.chat.alertSound) self.chat.sound.play('sendchat')
      var m = new Metamaps.Backbone.Message({
        message: data.message,
        resource_id: Active.Map.id,
        resource_type: "Map"
      })
      m.save(null, {
        success: function (model, response) {
          self.addMessages(new Metamaps.Backbone.MessageCollection(model), false, true)
          $(document).trigger(Room.events.newMessage, [model])
        },
        error: function (model, response) {
          console.log('error!', response)
        }
      })
  }

  // they should be instantiated as backbone models before they get
  // passed to this function
  Room.prototype.addMessages = function (messages, isInitial, wasMe) {
    var self = this

    messages.models.forEach(function (message) {
      self.chat.addMessage(message, isInitial, wasMe)
    })
  }

/**
 * @class
 * @static
 */
Room.events = {
    newMessage: "Room:newMessage"
}

export default Room
