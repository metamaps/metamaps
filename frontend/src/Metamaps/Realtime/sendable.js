import Active from '../Active'
import GlobalUI from '../GlobalUI'

import {
  REQUEST_LIVE_MAPS,
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
  CREATE_MESSAGE,
  DRAG_TOPIC,
  CREATE_TOPIC,
  UPDATE_TOPIC,
  REMOVE_TOPIC,
  DELETE_TOPIC,
  CREATE_SYNAPSE,
  UPDATE_SYNAPSE,
  REMOVE_SYNAPSE,
  DELETE_SYNAPSE,
  UPDATE_MAP
} from './events'

export const requestLiveMaps = (self, socket) => () => {
  socket.emit(REQUEST_LIVE_MAPS)
}

export const joinMap = (self, socket) => () => {
  socket.emit(JOIN_MAP, {
    userid: Active.Mapper.id,
    username: Active.Mapper.get('name'),
    userimage: Active.Mapper.get('image'),
    mapid: Active.Map.id,
    map: Active.Map.attributes
  })
}

export const leaveMap = (self, socket) => () => {
  socket.emit(LEAVE_MAP)
}

export const checkForCall = (self, socket) => () => {
 socket.emit(CHECK_FOR_CALL, { room: self.room.room, mapid: Active.Map.id })
}

export const sendMapperInfo = (self, socket) => userid => {
  // send this new mapper back your details, and the awareness that you've loaded the map
  var update = {
    userToNotify: userid,
    username: Active.Mapper.get('name'),
    userimage: Active.Mapper.get('image'),
    userid: Active.Mapper.id,
    userinconversation: self.inConversation,
    mapid: Active.Map.id
  }
  socket.emit(SEND_MAPPER_INFO, update)
}

export const joinCall = (self, socket) => () => {
  self.webrtc.off('readyToCall')
  self.webrtc.once('readyToCall', function () {
    self.videoInitialized = true
    self.readyToCall = true
    self.localVideo.view.manuallyPositioned = false
    self.positionVideos()
    self.localVideo.view.$container.show()
    if (self.localVideo) {
      $('#wrapper').append(self.localVideo.view.$container)
    }
    self.room.join()
  })
  self.inConversation = true
  socket.emit(JOIN_CALL, {
    mapid: Active.Map.id,
    id: Active.Mapper.id
  })
  self.webrtc.startLocalVideo()
  GlobalUI.clearNotify()
  self.room.chat.mapperJoinedCall(Active.Mapper.id)
}

export const leaveCall = (self, socket) => () => {
  socket.emit(LEAVE_CALL, {
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
}

export const acceptCall = (self, socket) => userid => {
  self.room.chat.sound.stop(self.soundId)
  socket.emit(ACCEPT_CALL, {
    mapid: Active.Map.id,
    invited: Active.Mapper.id,
    inviter: userid
  })
  $.post('/maps/' + Active.Map.id + '/events/conversation')
  self.joinCall()
  GlobalUI.clearNotify()
}

export const denyCall = (self, socket) => userid => {
  self.room.chat.sound.stop(self.soundId)
  socket.emit(DENY_CALL, {
    mapid: Active.Map.id,
    invited: Active.Mapper.id,
    inviter: userid
  })
  GlobalUI.clearNotify()
}

export const denyInvite = (self, socket) => userid => {
  self.room.chat.sound.stop(self.soundId)
  socket.emit(DENY_INVITE, {
    mapid: Active.Map.id,
    invited: Active.Mapper.id,
    inviter: userid
  })
  GlobalUI.clearNotify()
}

export const inviteACall = (self, socket) => userid => {
  socket.emit(INVITE_A_CALL, {
    mapid: Active.Map.id,
    inviter: Active.Mapper.id,
    invited: userid
  })
  self.room.chat.invitationPending(userid)
  GlobalUI.clearNotify()
}

export const inviteToJoin = (self, socket) => userid => {
  socket.emit(INVITE_TO_JOIN, {
    mapid: Active.Map.id,
    inviter: Active.Mapper.id,
    invited: userid
  })
  self.room.chat.invitationPending(userid)
}

export const sendCoords = (self, socket) => coords => {
  var map = Active.Map
  var mapper = Active.Mapper
  if (map.authorizeToEdit(mapper)) {
    var update = {
      usercoords: coords,
      userid: Active.Mapper.id,
      mapid: Active.Map.id
    }
    socket.emit(SEND_COORDS, update)
  }
}

export const dragTopic = (self, socket) => positions => {
  if (Active.Map) {
    positions.mapid = Active.Map.id
    socket.emit(DRAG_TOPIC, positions)
  }
}

export const updateTopic = (self, socket) => topic => {
  var data = {
    topicId: topic.id
  }
  socket.emit(UPDATE_TOPIC, data)
}

export const updateSynapse = (self, socket) => synapse => {
  var data = {
    synapseId: synapse.id
  }
  socket.emit(UPDATE_SYNAPSE, data)
}

export const updateMap = (self, socket) => map => {
  var data = {
    mapId: map.id
  }
  socket.emit(UPDATE_MAP, data)
}

export const createMessage = (self, socket) => data => {
  var message = data.attributes
  message.mapid = Active.Map.id
  socket.emit(CREATE_MESSAGE, message)
}

export const createTopic = (self, socket) => data => {
  if (Active.Map) {
    data.mapperid = Active.Mapper.id
    data.mapid = Active.Map.id
    socket.emit(CREATE_TOPIC, data)
  }
}

export const deleteTopic = (self, socket) => data => {
  if (Active.Map) {
    socket.emit(DELETE_TOPIC, data)
  }
}

export const removeTopic = (self, socket) => data => {
  if (Active.Map) {
    data.mapid = Active.Map.id
    socket.emit(REMOVE_TOPIC, data)
  }
}

export const createSynapse = (self, socket) => data => {
  if (Active.Map) {
    data.mapperid = Active.Mapper.id
    data.mapid = Active.Map.id
    socket.emit(CREATE_SYNAPSE, data)
  }
}

export const deleteSynapse = (self, socket) => data => {
  if (Active.Map) {
    data.mapid = Active.Map.id
    socket.emit(DELETE_SYNAPSE, data)
  }
}

export const removeSynapse = (self, socket) => data => {
  if (Active.Map) {
    data.mapid = Active.Map.id
    socket.emit(REMOVE_SYNAPSE, data)
  }
}
