/* global $ */

import Active from '../Active'
import { ChatView } from '../Views'
import GlobalUI from '../GlobalUI'

import {
  JOIN_MAP,
  LEAVE_MAP,
  CHECK_FOR_CALL,
  ACCEPT_CALL,
  DENY_CALL,
  DENY_INVITE,
  INVITE_TO_JOIN,
  INVITE_A_CALL,
  JOIN_CALL,
  LEAVE_CALL,
  SEND_MAPPER_INFO,
  SEND_COORDS,
  DRAG_TOPIC
} from './events'

export const joinMap = self => () => {
  self.socket.emit(JOIN_MAP, {
    userid: Active.Mapper.id,
    username: Active.Mapper.get('name'),
    avatar: Active.Mapper.get('image'),
    mapid: Active.Map.id,
    map: Active.Map.attributes
  })
}

export const leaveMap = self => () => {
  self.socket.emit(LEAVE_MAP)
}

export const checkForCall = self => () => {
  self.socket.emit(CHECK_FOR_CALL, { room: self.room.room, mapid: Active.Map.id })
}

export const sendMapperInfo = self => userid => {
  // send this new mapper back your details, and the awareness that you've loaded the map
  var update = {
    userToNotify: userid,
    username: Active.Mapper.get('name'),
    avatar: Active.Mapper.get('image'),
    userid: Active.Mapper.id,
    userinconversation: self.inConversation,
    mapid: Active.Map.id
  }
  self.socket.emit(SEND_MAPPER_INFO, update)
}

export const joinCall = self => () => {
  self.webrtc.off('readyToCall')
  self.webrtc.once('readyToCall', function() {
    self.videoInitialized = true
    self.readyToCall = true
    self.localVideo.view.manuallyPositioned = false
    self.positionVideos()
    self.localVideo.view.$container.show()
    if (self.localVideo) {
      $('#wrapper').append(self.localVideo.view.$container)
    }
    self.room.join()
    ChatView.conversationInProgress(true)
  })
  self.inConversation = true
  self.socket.emit(JOIN_CALL, {
    mapid: Active.Map.id,
    id: Active.Mapper.id
  })
  self.webrtc.startLocalVideo()
  GlobalUI.clearNotify()
  ChatView.mapperJoinedCall(Active.Mapper.id)
}

export const leaveCall = self => () => {
  self.socket.emit(LEAVE_CALL, {
    mapid: Active.Map.id,
    id: Active.Mapper.id
  })

  ChatView.mapperLeftCall(Active.Mapper.id)
  ChatView.leaveConversation() // the conversation will carry on without you
  self.room.leaveVideoOnly()
  self.inConversation = false
  self.localVideo.view.$container.hide()

  // if there's only two people in the room, and we're leaving
  // we should shut down the call locally
  if (self.countOthersInConversation() === 1) {
    self.callEnded()
  }
}

export const acceptCall = self => userid => {
  ChatView.sound.stop(self.soundId)
  self.socket.emit(ACCEPT_CALL, {
    mapid: Active.Map.id,
    invited: Active.Mapper.id,
    inviter: userid
  })
  $.post('/maps/' + Active.Map.id + '/events/conversation')
  self.joinCall()
  GlobalUI.clearNotify()
}

export const denyCall = self => userid => {
  ChatView.sound.stop(self.soundId)
  self.socket.emit(DENY_CALL, {
    mapid: Active.Map.id,
    invited: Active.Mapper.id,
    inviter: userid
  })
  GlobalUI.clearNotify()
}

export const denyInvite = self => userid => {
  ChatView.sound.stop(self.soundId)
  self.socket.emit(DENY_INVITE, {
    mapid: Active.Map.id,
    invited: Active.Mapper.id,
    inviter: userid
  })
  GlobalUI.clearNotify()
}

export const inviteACall = self => userid => {
  self.socket.emit(INVITE_A_CALL, {
    mapid: Active.Map.id,
    inviter: Active.Mapper.id,
    invited: userid
  })
  ChatView.invitationPending(userid)
  GlobalUI.clearNotify()
}

export const inviteToJoin = self => userid => {
  self.socket.emit(INVITE_TO_JOIN, {
    mapid: Active.Map.id,
    inviter: Active.Mapper.id,
    invited: userid
  })
  ChatView.invitationPending(userid)
}

export const sendCoords = self => coords => {
  var map = Active.Map
  var mapper = Active.Mapper
  if (map && map.authorizeToEdit(mapper)) {
    var update = {
      usercoords: coords,
      userid: Active.Mapper.id,
      mapid: Active.Map.id
    }
    self.socket.emit(SEND_COORDS, update)
  }
}

export const dragTopic = self => positions => {
  if (Active.Map) {
    positions.mapid = Active.Map.id
    self.socket.emit(DRAG_TOPIC, positions)
  }
}

