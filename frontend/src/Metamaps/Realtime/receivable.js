/* global $ */

/*
everthing in this file happens as a result of websocket events
*/

import { JUNTO_UPDATED } from './events'

import Active from '../Active'
import { ChatView } from '../Views'
import DataModel from '../DataModel'
import GlobalUI from '../GlobalUI'
import Util from '../Util'
import Visualize from '../Visualize'

export const juntoUpdated = self => state => {
  self.juntoState = state
  $(document).trigger(JUNTO_UPDATED)
}

/* All the following events are received through the nodejs realtime server
    and are done this way because they are transient data, not persisted to the server */
export const topicDragged = self => positions => {
  var topic
  var node

  if (Active.Map) {
    for (var key in positions) {
      topic = DataModel.Topics.get(key)
      if (topic) node = topic.get('node')
      if (node) node.pos.setc(positions[key].x, positions[key].y)
    } // for
    Visualize.mGraph.plot()
  }
}

export const peerCoordsUpdated = self => data => {
  if (!self.mappersOnMap[data.userid]) return
  self.mappersOnMap[data.userid].coords = {x: data.usercoords.x, y: data.usercoords.y}
  self.positionPeerIcon(data.userid)
}

export const lostMapper = self => data => {
  // data.userid
  // data.username
  delete self.mappersOnMap[data.userid]
  ChatView.sound.play('leavemap')
  // $('#mapper' + data.userid).remove()
  $('#compass' + data.userid).remove()
  ChatView.removeParticipant(ChatView.participants.findWhere({id: data.userid}))

  GlobalUI.notifyUser(data.username + ' just left the map')

  if ((self.inConversation && self.countOthersInConversation() === 0) ||
    (!self.inConversation && self.countOthersInConversation() === 1)) {
    self.callEnded()
  }
}

export const mapperListUpdated = self => data => {
  // data.userid
  // data.username
  // data.avatar

  self.mappersOnMap[data.userid] = {
    id: data.userid,
    name: data.username,
    username: data.username,
    image: data.avatar,
    color: Util.getPastelColor(),
    inConversation: data.userinconversation,
    coords: {
      x: 0,
      y: 0
    }
  }

  if (data.userid !== Active.Mapper.id) {
    ChatView.addParticipant(self.mappersOnMap[data.userid])
    if (data.userinconversation) ChatView.mapperJoinedCall(data.userid)

    // create a div for the collaborators compass
    self.createCompass(data.username, data.userid, data.avatar, self.mappersOnMap[data.userid].color)
  }
}

export const newMapper = self => data => {
  // data.userid
  // data.username
  // data.avatar
  // data.coords
  var firstOtherPerson = Object.keys(self.mappersOnMap).length === 0

  self.mappersOnMap[data.userid] = {
    id: data.userid,
    name: data.username,
    username: data.username,
    image: data.avatar,
    color: Util.getPastelColor(),
    coords: {
      x: 0,
      y: 0
    }
  }

  // create an item for them in the realtime box
  if (data.userid !== Active.Mapper.id) {
    ChatView.sound.play('joinmap')
    ChatView.addParticipant(self.mappersOnMap[data.userid])

    // create a div for the collaborators compass
    self.createCompass(data.username, data.userid, data.avatar, self.mappersOnMap[data.userid].color)

    var notifyMessage = data.username + ' just joined the map'
    if (firstOtherPerson) {
      notifyMessage += ' <button type="button" class="toast-button button">Suggest A Video Call</button>'
    }
    GlobalUI.notifyUser(notifyMessage)
    $('#toast button').click(e => self.inviteACall(data.userid))
    self.sendMapperInfo(data.userid)
  }
}

export const callAccepted = self => userid => {
  // const username = self.mappersOnMap[userid].name
  GlobalUI.notifyUser('Conversation starting...')
  self.joinCall()
  ChatView.invitationAnswered(userid)
}

export const callDenied = self => userid => {
  var username = self.mappersOnMap[userid].name
  GlobalUI.notifyUser(username + " didn't accept your invitation")
  ChatView.invitationAnswered(userid)
}

export const inviteDenied = self => userid => {
  var username = self.mappersOnMap[userid].name
  GlobalUI.notifyUser(username + " didn't accept your invitation")
  ChatView.invitationAnswered(userid)
}

export const invitedToCall = self => inviter => {
  ChatView.sound.stop(self.soundId)
  self.soundId = ChatView.sound.play('sessioninvite')

  var username = self.mappersOnMap[inviter].name
  var notifyText = '<img src="' + self['junto_spinner_darkgrey.gif'] + '" style="display: inline-block; margin-top: -12px; margin-bottom: -6px; vertical-align: top;" />'
  notifyText += username + ' is inviting you to a conversation. Join live?'
  notifyText += ' <button type="button" class="toast-button button yes">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no no">No</button>'
  GlobalUI.notifyUser(notifyText, true)
  $('#toast button.yes').click(e => self.acceptCall(inviter))
  $('#toast button.no').click(e => self.denyCall(inviter))
}

export const invitedToJoin = self => inviter => {
  ChatView.sound.stop(self.soundId)
  self.soundId = ChatView.sound.play('sessioninvite')

  var username = self.mappersOnMap[inviter].name
  var notifyText = username + ' is inviting you to the conversation. Join?'
  notifyText += ' <button type="button" class="toast-button button yes">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no no">No</button>'
  GlobalUI.notifyUser(notifyText, true)
  $('#toast button.yes').click(e => self.joinCall())
  $('#toast button.no').click(e => self.denyInvite(inviter))
}

export const mapperJoinedCall = self => id => {
  var mapper = self.mappersOnMap[id]
  if (mapper) {
    if (self.inConversation) {
      var username = mapper.name
      var notifyText = username + ' joined the call'
      GlobalUI.notifyUser(notifyText)
    }
    mapper.inConversation = true
    ChatView.mapperJoinedCall(id)
  }
}

export const mapperLeftCall = self => id => {
  var mapper = self.mappersOnMap[id]
  if (mapper) {
    if (self.inConversation) {
      var username = mapper.name
      var notifyText = username + ' left the call'
      GlobalUI.notifyUser(notifyText)
    }
    mapper.inConversation = false
    ChatView.mapperLeftCall(id)
    if ((self.inConversation && self.countOthersInConversation() === 0) ||
      (!self.inConversation && self.countOthersInConversation() === 1)) {
      self.callEnded()
    }
  }
}

export const callInProgress = self => () => {
  var notifyText = "There's a conversation happening, want to join?"
  notifyText += ' <button type="button" class="toast-button button yes">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no no">No</button>'
  GlobalUI.notifyUser(notifyText, true)
  $('#toast button.yes').click(e => self.joinCall())
  $('#toast button.no').click(e => GlobalUI.clearNotify())
  ChatView.conversationInProgress()
}

export const callStarted = self => () => {
  if (self.inConversation) return
  var notifyText = "There's a conversation starting, want to join?"
  notifyText += ' <button type="button" class="toast-button button">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no">No</button>'
  GlobalUI.notifyUser(notifyText, true)
  $('#toast button.yes').click(e => self.joinCall())
  $('#toast button.no').click(e => GlobalUI.clearNotify())
  ChatView.conversationInProgress()
}

