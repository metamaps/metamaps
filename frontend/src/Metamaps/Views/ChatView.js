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
import MapChat from '../../components/MapChat'

const ChatView = {
  isOpen: false,
  messages: new Backbone.Collection(),
  conversationLive: false,
  isParticipating: false,
  mapChat: null,
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
    self.conversationLive = false
    self.isParticipating = false
    self.alertSound = true // whether to play sounds on arrival of new messages or not
    self.cursorsShowing = true
    self.videosShowing = true
    self.participants = new Backbone.Collection()
    self.render()
  },
  show: () => {
    $('#' + ChatView.domId).show()
  },
  hide: () => {
    $('#' + ChatView.domId).hide()
  },
  render: () => {
    if (!Active.Map) return    
    const self = ChatView
    self.mapChat = ReactDOM.render(React.createElement(MapChat, {
      conversationLive: self.conversationLive,
      isParticipating: self.isParticipating,
      onOpen: self.onOpen,
      onClose: self.onClose,
      leaveCall: Realtime.leaveCall,
      joinCall: Realtime.joinCall,
      inviteACall: Realtime.inviteACall,
      inviteToJoin: Realtime.inviteToJoin,
      participants: self.participants.models.map(p => p.attributes),
      messages: self.messages.models.map(m => m.attributes),
      videoToggleClick: self.videoToggleClick,
      cursorToggleClick: self.cursorToggleClick,
      soundToggleClick: self.soundToggleClick,
      inputBlur: self.inputBlur,
      inputFocus: self.inputFocus,
      handleInputMessage: self.handleInputMessage
    }), document.getElementById(ChatView.domId))
  },
  onOpen: () => {
    $(document).trigger(ChatView.events.openTray)
  },
  onClose: () => {
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
  close: () => {
    ChatView.mapChat.close()
  },
  open: () => {
    ChatView.mapChat.open()
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
    if (!isInitial) self.mapChat.newMessage() 
    if (!wasMe && !isInitial && self.alertSound) self.sound.play('receivechat')
    self.messages.add(message)
    self.render()
    if (!isInitial) self.mapChat.scroll()
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
        $(document).trigger(ChatView.events.newMessage, [model])
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
  },
  reset: () => {
    ChatView.mapChat.reset()
    ChatView.participants.reset()
    ChatView.messages.reset()
    ChatView.render()
  }
}

// ChatView.prototype.scrollMessages = function(duration) {
//   duration = duration || 0

//   this.$messages.animate({
//     scrollTop: this.$messages[0].scrollHeight
//   }, duration)
// }

/**
 * @class
 * @static
 */
ChatView.events = {
  newMessage: 'ChatView:newMessage',
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
