/* global $ */

/*
everthing in this file happens as a result of websocket events
*/

import { JUNTO_UPDATED } from './events'

import Active from '../Active'
import GlobalUI from '../GlobalUI'
import Control from '../Control'
import Map from '../Map'
import Mapper from '../Mapper'
import Topic from '../Topic'
import Synapse from '../Synapse'
import Util from '../Util'
import Visualize from '../Visualize'

export const juntoUpdated = self => state => {
  self.juntoState = state
  $(document).trigger(JUNTO_UPDATED)
}

export const synapseRemoved = self => data => {
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
}

export const synapseDeleted = self => data => {
  self.synapseRemoved(data)
}

export const synapseCreated = self => data => {
  var topic1, topic2, node1, node2, synapse, mapping, cancel, mapper


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
}

export const topicRemoved = self => data => {
  var topic = Metamaps.Topics.get(data.mappableid)
  if (topic) {
    var node = topic.get('node')
    var mapping = topic.getMapping()
    Control.hideNode(node.id)
    Metamaps.Topics.remove(topic)
    Metamaps.Mappings.remove(mapping)
  }
}

export const topicDeleted = self => data => {
  self.topicRemoved(data)
}

export const topicCreated = self => data => {
  var topic, mapping, mapper, cancel

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
}

export const messageCreated = self => data => {
  self.room.addMessages(new Metamaps.Backbone.MessageCollection(data))
}

export const mapUpdated = self => data => {
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
}

export const topicUpdated = self => data => {
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
}

export const synapseUpdated = self => data => {
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
}

export const topicDragged = self => positions => {
  var topic
  var node

  if (Active.Map) {
    for (var key in positions) {
      topic = Metamaps.Topics.get(key)
      if (topic) node = topic.get('node')
      if (node) node.pos.setc(positions[key].x, positions[key].y)
    } // for
    Visualize.mGraph.plot()
  }
}

export const peerCoordsUpdated = self => data => {
  if (!self.mappersOnMap[data.userid]) return
  self.mappersOnMap[data.userid].coords = {x: data.usercoords.x,y: data.usercoords.y}
  self.positionPeerIcon(data.userid)
}

export const lostMapper = self => data => {
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
    self.room.chat.addParticipant(self.mappersOnMap[data.userid])
    if (data.userinconversation) self.room.chat.mapperJoinedCall(data.userid)

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
    self.room.chat.sound.play('joinmap')
    self.room.chat.addParticipant(self.mappersOnMap[data.userid])

    // create a div for the collaborators compass
    self.createCompass(data.username, data.userid, data.avatar, self.mappersOnMap[data.userid].color)

    var notifyMessage = data.username + ' just joined the map'
    if (firstOtherPerson) {
      notifyMessage += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.inviteACall(' + data.userid + ')">Suggest A Video Call</button>'
    }
    GlobalUI.notifyUser(notifyMessage)
    self.sendMapperInfo(data.userid)
  }
}

export const callAccepted = self => userid => {
  var username = self.mappersOnMap[userid].name
  GlobalUI.notifyUser('Conversation starting...')
  self.joinCall()
  self.room.chat.invitationAnswered(userid)
}

export const callDenied = self => userid => {
  var username = self.mappersOnMap[userid].name
  GlobalUI.notifyUser(username + " didn't accept your invitation")
  self.room.chat.invitationAnswered(userid)
}

export const inviteDenied = self => userid => {
  var username = self.mappersOnMap[userid].name
  GlobalUI.notifyUser(username + " didn't accept your invitation")
  self.room.chat.invitationAnswered(userid)
}

export const invitedToCall = self => inviter => {
  self.room.chat.sound.stop(self.soundId)
  self.soundId = self.room.chat.sound.play('sessioninvite')

  var username = self.mappersOnMap[inviter].name
  var notifyText = '<img src="' + Metamaps.Erb['junto_spinner_darkgrey.gif'] + '" style="display: inline-block; margin-top: -12px; margin-bottom: -6px; vertical-align: top;" />'
  notifyText += username + ' is inviting you to a conversation. Join live?'
  notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.acceptCall(' + inviter + ')">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.Realtime.denyCall(' + inviter + ')">No</button>'
  GlobalUI.notifyUser(notifyText, true)
}

export const invitedToJoin = self => inviter => {
  self.room.chat.sound.stop(self.soundId)
  self.soundId = self.room.chat.sound.play('sessioninvite')

  var username = self.mappersOnMap[inviter].name
  var notifyText = username + ' is inviting you to the conversation. Join?'
  notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.Realtime.denyInvite(' + inviter + ')">No</button>'
  GlobalUI.notifyUser(notifyText, true)
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
    self.room.chat.mapperJoinedCall(id)
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
    self.room.chat.mapperLeftCall(id)
    if ((self.inConversation && self.countOthersInConversation() === 0) ||
      (!self.inConversation && self.countOthersInConversation() === 1)) {
      self.callEnded()
    }
  }
}

export const callInProgress = self => () => {
  var notifyText = "There's a conversation happening, want to join?"
  notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.GlobalUI.clearNotify()">No</button>'
  GlobalUI.notifyUser(notifyText, true)
  self.room.conversationInProgress()
}

export const callStarted = self => () => {
  if (self.inConversation) return
  var notifyText = "There's a conversation starting, want to join?"
  notifyText += ' <button type="button" class="toast-button button" onclick="Metamaps.Realtime.joinCall()">Yes</button>'
  notifyText += ' <button type="button" class="toast-button button btn-no" onclick="Metamaps.GlobalUI.clearNotify()">No</button>'
  GlobalUI.notifyUser(notifyText, true)
  self.room.conversationInProgress()
}

