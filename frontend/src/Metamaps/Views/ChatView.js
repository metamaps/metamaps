/* global $ */

import Backbone from 'backbone'
import { Howl } from 'howler'
import React from 'react'
import ReactDOM from 'react-dom'
// TODO is this line good or bad
// Backbone.$ = window.$

import Active from '../Active'
import DataModel from '../DataModel'
import Realtime from '../Realtime'
import ReactApp from '../GlobalUI/ReactApp'

const ChatView = {
  isOpen: false,
  unreadMessages: 0,
  messages: new Backbone.Collection(),
  conversationLive: false,
  isParticipating: false,
  domId: 'chat-box-wrapper',
  init: function(urls) {
    const self = ChatView
    self.sound = new Howl({
      src: urls,
      sprite: {
        joinmap: [0, 561],
        leavemap: [1000, 592],
        receivechat: [2000, 318],
        sendchat: [3000, 296],
        sessioninvite: [4000, 5393, true]
      }
    })
  },
  setNewMap: function() {
    const self = ChatView
    self.unreadMessages = 0
    self.isOpen = false
    self.conversationLive = false
    self.isParticipating = false
    self.alertSound = true // whether to play sounds on arrival of new messages or not
    self.cursorsShowing = true
    self.videosShowing = true
    self.participants = new Backbone.Collection()
    self.messages = new Backbone.Collection()
    self.render()
  },
  render: () => {
    if (!Active.Map) return
    const self = ChatView
    ReactApp.render()
  },
  onOpen: () => {
    const self = ChatView
    self.isOpen = true
    self.unreadMessages = 0
    self.render()
    $(document).trigger(ChatView.events.openTray)
  },
  onClose: () => {
    const self = ChatView
    self.isOpen = false
    $(document).trigger(ChatView.events.closeTray)
  },
  addParticipant: participant => {
    ChatView.participants.add(participant)
    ChatView.render()
  },
  removeParticipant: participant => {
    ChatView.participants.remove(participant)
    ChatView.render()
  },
  leaveConversation: () => {
    ChatView.isParticipating = false
    ChatView.render()
  },
  mapperJoinedCall: id => {
    const mapper = ChatView.participants.findWhere({id})
    mapper && mapper.set('isParticipating', true)
    ChatView.render()
  },
  mapperLeftCall: id => {
    const mapper = ChatView.participants.findWhere({id})
    mapper && mapper.set('isParticipating', false)
    ChatView.render()
  },
  invitationPending: id => {
    const mapper = ChatView.participants.findWhere({id})
    mapper && mapper.set('isPending', true)
    ChatView.render()
  },
  invitationAnswered: id => {
    const mapper = ChatView.participants.findWhere({id})
    mapper && mapper.set('isPending', false)
    ChatView.render()
  },
  conversationInProgress: participating => {
    ChatView.conversationLive = true
    ChatView.isParticipating = participating
    ChatView.render()
  },
  conversationEnded: () => {
    ChatView.conversationLive = false
    ChatView.isParticipating = false
    ChatView.participants.forEach(p => p.set({isParticipating: false, isPending: false}))
    ChatView.render()
  },
  videoToggleClick: function() {
    ChatView.videosShowing = !ChatView.videosShowing
    $(document).trigger(ChatView.videosShowing ? ChatView.events.videosOn : ChatView.events.videosOff)
  },
  cursorToggleClick: function() {
    ChatView.cursorsShowing = !ChatView.cursorsShowing
    $(document).trigger(ChatView.cursorsShowing ? ChatView.events.cursorsOn : ChatView.events.cursorsOff)
  },
  soundToggleClick: function() {
    ChatView.alertSound = !ChatView.alertSound
  },
  inputFocus: () => {
    $(document).trigger(ChatView.events.inputFocus)
  },
  inputBlur: () => {
    $(document).trigger(ChatView.events.inputBlur)
  },
  addMessage: (message, isInitial, wasMe) => {
    const self = ChatView
    if (!isInitial && !self.isOpen) self.unreadMessages += 1
    if (!wasMe && !isInitial && self.alertSound) self.sound.play('receivechat')
    self.messages.add(message)
    if (!isInitial && self.isOpen) self.render()
  },
  sendChatMessage: message => {
    var self = ChatView
    if (ChatView.alertSound) ChatView.sound.play('sendchat')
    var m = new DataModel.Message({
      message: message.message,
      resource_id: Active.Map.id,
      resource_type: 'Map'
    })
    m.save(null, {
      success: function(model, response) {
        self.addMessages(new DataModel.MessageCollection(model), false, true)
      },
      error: function(model, response) {
        console.log('error!', response)
      }
    })
  },
  handleInputMessage: text => {
    ChatView.sendChatMessage({message: text})
  },
  // they should be instantiated as backbone models before they get
  // passed to this function
  addMessages: (messages, isInitial, wasMe) => {
    messages.models.forEach(m => ChatView.addMessage(m, isInitial, wasMe))
  }
}

/**
 * @class
 * @static
 */
ChatView.events = {
  openTray: 'ChatView:openTray',
  closeTray: 'ChatView:closeTray',
  inputFocus: 'ChatView:inputFocus',
  inputBlur: 'ChatView:inputBlur',
  cursorsOff: 'ChatView:cursorsOff',
  cursorsOn: 'ChatView:cursorsOn',
  videosOff: 'ChatView:videosOff',
  videosOn: 'ChatView:videosOn'
}

export default ChatView
