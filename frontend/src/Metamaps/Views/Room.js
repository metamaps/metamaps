/* global $ */

import attachMediaStream from 'attachmediastream'

import Realtime from '../Realtime'
import VideoView from './VideoView'

const Room = function(opts = {}) {
  this.isActiveRoom = false
  this.socket = opts.socket
  this.webrtc = opts.webrtc
  this.room = opts.room
  this.config = opts.config
  this.$myVideo = opts.$video
  this.myVideo = opts.myVideoView
  this.videos = {}
  this.init()
}

Room.prototype.join = function(cb) {
  this.isActiveRoom = true
  this.webrtc.joinRoom(this.room, cb)
}

Room.prototype.leaveVideoOnly = function() {
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
}

Room.prototype.init = function() {
  var self = this

  $(document).on(VideoView.events.audioControlClick, function(event, videoView) {
    if (!videoView.audioStatus) self.webrtc.mute()
    else if (videoView.audioStatus) self.webrtc.unmute()
  })
  $(document).on(VideoView.events.videoControlClick, function(event, videoView) {
    if (!videoView.videoStatus) self.webrtc.pauseVideo()
    else if (videoView.videoStatus) self.webrtc.resumeVideo()
  })

  this.webrtc.webrtc.off('peerStreamAdded')
  this.webrtc.webrtc.off('peerStreamRemoved')
  this.webrtc.on('peerStreamAdded', function(peer) {
    var mapper = Realtime.mappersOnMap[peer.nick]
    peer.avatar = mapper.image
    peer.username = mapper.name
    if (self.isActiveRoom) {
      self.addVideo(peer)
    }
  })

  this.webrtc.on('peerStreamRemoved', function(peer) {
    if (self.isActiveRoom) {
      self.removeVideo(peer)
    }
  })

  this.webrtc.on('mute', function(data) {
    var v = self.videos[data.id]
    if (!v) return

    if (data.name === 'audio') {
      v.audioStatus = false
    } else if (data.name === 'video') {
      v.videoStatus = false
      v.$avatar.show()
    }
    if (!v.audioStatus && !v.videoStatus) v.$container.hide()
  })
  this.webrtc.on('unmute', function(data) {
    const v = self.videos[data.id]
    if (!v) return

    if (data.name === 'audio') {
      v.audioStatus = true
    } else if (data.name === 'video') {
      v.videoStatus = true
      v.$avatar.hide()
    }
    v.$container.show()
  })
}

Room.prototype.videoAdded = function(callback) {
  this._videoAdded = callback
}

Room.prototype.addVideo = function(peer) {
  const id = this.webrtc.getDomId(peer)
  const video = attachMediaStream(peer.stream)

  const v = new VideoView(video, null, id, false, { DOUBLE_CLICK_TOLERANCE: 200, avatar: peer.avatar, username: peer.username })

  this.videos[peer.id] = v
  if (this._videoAdded) this._videoAdded(v, peer.nick)
}

Room.prototype.removeVideo = function(peer) {
  var id = typeof peer === 'string' ? peer : peer.id
  if (this.videos[id]) {
    this.videos[id].remove()
    delete this.videos[id]
  }
}

export default Room
