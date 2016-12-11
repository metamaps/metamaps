/* global $ */

import Backbone from 'backbone'
import { Howl } from 'howler'
import Autolinker from 'autolinker'
import { clone, template as lodashTemplate } from 'lodash'
import outdent from 'outdent'
// TODO is this line good or bad
// Backbone.$ = window.$

const linker = new Autolinker({ newWindow: true, truncate: 50, email: false, phone: false })

var Private = {
  messageHTML: outdent`
    <div class='chat-message'>
      <div class='chat-message-user'><img src='{{ user_image }}' title='{{user_name }}'/></div>
      <div class='chat-message-text'>{{ message }}</div>
      <div class='chat-message-time'>{{ timestamp }}</div>
      <div class='clearfloat'></div>
    </div>`,
  participantHTML: outdent`
    <div class='participant participant-{{ id }} {{ selfClass }}'>
      <div class='chat-participant-image'>
        <img src='{{ image }}' style='border: 2px solid {{ color }};' />
      </div>
      <div class='chat-participant-name'>
        {{ username }} {{ selfName }}
      </div>
      <button type='button'
        class='button chat-participant-invite-call'
        onclick='Metamaps.Realtime.inviteACall({{ id}});'
      ></button>
      <button type='button'
        class='button chat-participant-invite-join'
        onclick='Metamaps.Realtime.inviteToJoin({{ id}});'
      ></button>
      <span class='chat-participant-participating'>
        <div class='green-dot'></div>
      </span>
      <div class='clearfloat'></div>
    </div>`,
  templates: function() {
    const templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    }

    this.messageTemplate = lodashTemplate(Private.messageHTML, templateSettings)

    this.participantTemplate = lodashTemplate(Private.participantHTML, templateSettings)
  },
  createElements: function() {
    this.$unread = $('<div class="chat-unread"></div>')
    this.$button = $('<div class="chat-button"><div class="tooltips">Chat</div></div>')
    this.$messageInput = $('<textarea placeholder="Send a message..." class="chat-input"></textarea>')
    this.$juntoHeader = $('<div class="junto-header">PARTICIPANTS</div>')
    this.$videoToggle = $('<div class="video-toggle"></div>')
    this.$cursorToggle = $('<div class="cursor-toggle"></div>')
    this.$participants = $('<div class="participants"></div>')
    this.$conversationInProgress = $(outdent`
      <div class="conversation-live">
        LIVE
        <span class="call-action leave" onclick="Metamaps.Realtime.leaveCall();">
          LEAVE
        </span>
        <span class="call-action join" onclick="Metamaps.Realtime.joinCall();">
          JOIN
        </span>
      </div>`)
    this.$chatHeader = $('<div class="chat-header">CHAT</div>')
    this.$soundToggle = $('<div class="sound-toggle"></div>')
    this.$messages = $('<div class="chat-messages"></div>')
    this.$container = $('<div class="chat-box"></div>')
  },
  attachElements: function() {
    this.$button.append(this.$unread)

    this.$juntoHeader.append(this.$videoToggle)
    this.$juntoHeader.append(this.$cursorToggle)

    this.$chatHeader.append(this.$soundToggle)

    this.$participants.append(this.$conversationInProgress)

    this.$container.append(this.$juntoHeader)
    this.$container.append(this.$participants)
    this.$container.append(this.$chatHeader)
    this.$container.append(this.$button)
    this.$container.append(this.$messages)
    this.$container.append(this.$messageInput)
  },
  addEventListeners: function() {
    var self = this

    this.participants.on('add', function(participant) {
      Private.addParticipant.call(self, participant)
    })

    this.participants.on('remove', function(participant) {
      Private.removeParticipant.call(self, participant)
    })

    this.$button.on('click', function() {
      Handlers.buttonClick.call(self)
    })
    this.$videoToggle.on('click', function() {
      Handlers.videoToggleClick.call(self)
    })
    this.$cursorToggle.on('click', function() {
      Handlers.cursorToggleClick.call(self)
    })
    this.$soundToggle.on('click', function() {
      Handlers.soundToggleClick.call(self)
    })
    this.$messageInput.on('keyup', function(event) {
      Handlers.keyUp.call(self, event)
    })
    this.$messageInput.on('focus', function() {
      Handlers.inputFocus.call(self)
    })
    this.$messageInput.on('blur', function() {
      Handlers.inputBlur.call(self)
    })
  },
  initializeSounds: function(soundUrls) {
    this.sound = new Howl({
      src: soundUrls,
      sprite: {
        joinmap: [0, 561],
        leavemap: [1000, 592],
        receivechat: [2000, 318],
        sendchat: [3000, 296],
        sessioninvite: [4000, 5393, true]
      }
    })
  },
  incrementUnread: function() {
    this.unreadMessages++
    this.$unread.html(this.unreadMessages)
    this.$unread.show()
  },
  addMessage: function(message, isInitial, wasMe) {
    if (!this.isOpen && !isInitial) Private.incrementUnread.call(this)

    function addZero(i) {
      if (i < 10) {
        i = '0' + i
      }
      return i
    }
    var m = clone(message.attributes)

    m.timestamp = new Date(m.created_at)

    var date = (m.timestamp.getMonth() + 1) + '/' + m.timestamp.getDate()
    date += ' ' + addZero(m.timestamp.getHours()) + ':' + addZero(m.timestamp.getMinutes())
    m.timestamp = date
    m.image = m.user_image
    m.message = linker.link(m.message)
    var $html = $(this.messageTemplate(m))
    this.$messages.append($html)
    if (!isInitial) this.scrollMessages(200)

    if (!wasMe && !isInitial && this.alertSound) this.sound.play('receivechat')
  },
  initialMessages: function() {
    var messages = this.messages.models
    for (var i = 0; i < messages.length; i++) {
      Private.addMessage.call(this, messages[i], true)
    }
  },
  handleInputMessage: function() {
    var message = {
      message: this.$messageInput.val()
    }
    this.$messageInput.val('')
    $(document).trigger(ChatView.events.message + '-' + this.room, [message])
  },
  addParticipant: function(participant) {
    var p = clone(participant.attributes)
    if (p.self) {
      p.selfClass = 'is-self'
      p.selfName = '(me)'
    } else {
      p.selfClass = ''
      p.selfName = ''
    }
    var html = this.participantTemplate(p)
    this.$participants.append(html)
  },
  removeParticipant: function(participant) {
    this.$container.find('.participant-' + participant.get('id')).remove()
  }
}

var Handlers = {
  buttonClick: function() {
    if (this.isOpen) this.close()
    else if (!this.isOpen) this.open()
  },
  videoToggleClick: function() {
    this.$videoToggle.toggleClass('active')
    this.videosShowing = !this.videosShowing
    $(document).trigger(this.videosShowing ? ChatView.events.videosOn : ChatView.events.videosOff)
  },
  cursorToggleClick: function() {
    this.$cursorToggle.toggleClass('active')
    this.cursorsShowing = !this.cursorsShowing
    $(document).trigger(this.cursorsShowing ? ChatView.events.cursorsOn : ChatView.events.cursorsOff)
  },
  soundToggleClick: function() {
    this.alertSound = !this.alertSound
    this.$soundToggle.toggleClass('active')
  },
  keyUp: function(event) {
    switch (event.which) {
      case 13: // enter
        Private.handleInputMessage.call(this)
        break
    }
  },
  inputFocus: function() {
    $(document).trigger(ChatView.events.inputFocus)
  },
  inputBlur: function() {
    $(document).trigger(ChatView.events.inputBlur)
  }
}

const ChatView = function(messages, mapper, room, opts = {}) {
  this.room = room
  this.mapper = mapper
  this.messages = messages // backbone collection

  this.isOpen = false
  this.alertSound = true // whether to play sounds on arrival of new messages or not
  this.cursorsShowing = true
  this.videosShowing = true
  this.unreadMessages = 0
  this.participants = new Backbone.Collection()

  Private.templates.call(this)
  Private.createElements.call(this)
  Private.attachElements.call(this)
  Private.addEventListeners.call(this)
  Private.initialMessages.call(this)
  Private.initializeSounds.call(this, opts.soundUrls)
  this.$container.css({
    right: '-300px'
  })
}

ChatView.prototype.conversationInProgress = function(participating) {
  this.$conversationInProgress.show()
  this.$participants.addClass('is-live')
  if (participating) this.$participants.addClass('is-participating')
  this.$button.addClass('active')

// hide invite to call buttons
}

ChatView.prototype.conversationEnded = function() {
  this.$conversationInProgress.hide()
  this.$participants.removeClass('is-live')
  this.$participants.removeClass('is-participating')
  this.$button.removeClass('active')
  this.$participants.find('.participant').removeClass('active')
  this.$participants.find('.participant').removeClass('pending')
}

ChatView.prototype.leaveConversation = function() {
  this.$participants.removeClass('is-participating')
}

ChatView.prototype.mapperJoinedCall = function(id) {
  this.$participants.find('.participant-' + id).addClass('active')
}

ChatView.prototype.mapperLeftCall = function(id) {
  this.$participants.find('.participant-' + id).removeClass('active')
}

ChatView.prototype.invitationPending = function(id) {
  this.$participants.find('.participant-' + id).addClass('pending')
}

ChatView.prototype.invitationAnswered = function(id) {
  this.$participants.find('.participant-' + id).removeClass('pending')
}

ChatView.prototype.addParticipant = function(participant) {
  this.participants.add(participant)
}

ChatView.prototype.removeParticipant = function(username) {
  var p = this.participants.find(p => p.get('username') === username)
  if (p) {
    this.participants.remove(p)
  }
}

ChatView.prototype.removeParticipants = function() {
  this.participants.remove(this.participants.models)
}

ChatView.prototype.open = function() {
  this.$container.css({
    right: '0'
  })
  this.$messageInput.focus()
  this.isOpen = true
  this.unreadMessages = 0
  this.$unread.hide()
  this.scrollMessages(0)
  $(document).trigger(ChatView.events.openTray)
}

ChatView.prototype.addMessage = function(message, isInitial, wasMe) {
  this.messages.add(message)
  Private.addMessage.call(this, message, isInitial, wasMe)
}

ChatView.prototype.scrollMessages = function(duration) {
  duration = duration || 0

  this.$messages.animate({
    scrollTop: this.$messages[0].scrollHeight
  }, duration)
}

ChatView.prototype.clearMessages = function() {
  this.unreadMessages = 0
  this.$unread.hide()
  this.$messages.empty()
}

ChatView.prototype.close = function() {
  this.$container.css({
    right: '-300px'
  })
  this.$messageInput.blur()
  this.isOpen = false
  $(document).trigger(ChatView.events.closeTray)
}

ChatView.prototype.remove = function() {
  this.$button.off()
  this.$container.remove()
}

/**
 * @class
 * @static
 */
ChatView.events = {
  message: 'ChatView:message',
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
