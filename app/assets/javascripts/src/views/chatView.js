Metamaps.Views = Metamaps.Views || {};

Metamaps.Views.chatView = (function () {
    var
      chatView,
      linker = new Autolinker({ newWindow: true, truncate: 50, email: false, phone: false, twitter: false });

    var Private = {
        messageHTML: "<div class='chat-message'>" +
            "<div class='chat-message-user'><img src='<%= image %>' title='<%= user %>'/></div>" +
            "<div class='chat-message-text'><%= message %></div>" +
            "<div class='chat-message-time'><%= timestamp %></div>" +
            "<div class='clearfloat'></div>" +
          "</div>",
        participantHTML: "<div class='participant participant-<%= username %>'>" +
                "<div class='chat-participant-image'><img src='<%= image %>' /></div>" +
                "<div class='chat-participant-name'><%= username %></div>" +
                "<div class='clearfloat'></div>" +
              "</div>",
        templates: function() {
            this.messageTemplate = _.template(Private.messageHTML);

            this.participantTemplate = _.template(Private.participantHTML);
        },
        createElements: function() {
            this.$unread = $('<div class="chat-unread"></div>');
            this.$button = $('<div class="chat-button"></div>');
            this.$messageInput = $('<textarea placeholder="Send a message..." class="chat-input"></textarea>');
            this.$juntoHeader = $('<div class="junto-header">PARTICIPANTS</div>');
            this.$videoToggle = $('<div class="video-toggle"></div>');
            this.$cursorToggle = $('<div class="cursor-toggle"></div>');
            this.$participants = $('<div class="participants"></div>');
            this.$chatHeader = $('<div class="chat-header">CHAT</div>');
            this.$soundToggle = $('<div class="sound-toggle active"></div>');
            this.$messages = $('<div class="chat-messages"></div>');
            this.$container = $('<div class="chat-box"></div>');
        },
        attachElements: function() {
            this.$button.append(this.$unread);

            this.$juntoHeader.append(this.$videoToggle);
            this.$juntoHeader.append(this.$cursorToggle);

            this.$chatHeader.append(this.$soundToggle);

            this.$container.append(this.$juntoHeader);
            this.$container.append(this.$participants);
            this.$container.append(this.$chatHeader);
            this.$container.append(this.$messageInput);
            this.$container.append(this.$button);
            this.$container.append(this.$messages);
        },
        addEventListeners: function() {
            var self = this;

            this.participants.on('add', function (participant) {
                Private.addParticipant.call(self, participant);
            });

            this.participants.on('remove', function (participant) {
                Private.removeParticipant.call(self, participant);
            });

            // add the event listener so that when
            // the realtime module adds messages to the collection
            // from other mappers, it will update the UI
            this.messages.on('add', function (message) {
                Private.addMessage.call(self, message);
            });

            this.$button.on('click', function () {
                Handlers.buttonClick.call(self);
            });
            this.$videoToggle.on('click', function () {
                Handlers.videoToggleClick.call(self);
            });
            this.$cursorToggle.on('click', function () {
                Handlers.cursorToggleClick.call(self);
            });
            this.$soundToggle.on('click', function () {
                Handlers.soundToggleClick.call(self);
            });
            this.$messageInput.on('keyup', function (event) {
                Handlers.keyUp.call(self, event);
            });
            this.$messageInput.on('focus', function () {
                Handlers.inputFocus.call(self);
            });
            this.$messageInput.on('blur', function () {
                Handlers.inputBlur.call(self);
            });
        },
        initializeSounds: function() {
            this.sound = new Howl({
              urls: ['/assets/sounds/sounds.mp3', '/assets/sounds/sounds.ogg'],
              sprite: {
                laser: [3000, 700]
              }
            });
        },
        incrementUnread: function() {
            this.unreadMessages++;
            this.$unread.html(this.unreadMessages);
            this.$unread.show();
        },
        addMessage: function(message) {

            if (!this.isOpen) Private.incrementUnread.call(this);

            function addZero(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
            var m = _.clone(message.attributes);

            var today = new Date();
            m.timestamp = new Date(m.timestamp);

            var date = (m.timestamp.getMonth() + 1) + '/' + m.timestamp.getDate();
            date += " " + addZero(m.timestamp.getHours()) + ":" + addZero(m.timestamp.getMinutes());
            m.timestamp = date;
            m.image = m.image || 'http://www.hotpepper.ca/wp-content/uploads/2014/11/default_profile_1_200x200.png';
            m.message = linker.link(m.message);
            var $html = $(this.messageTemplate(m));
            this.$messages.append($html);
            this.scrollMessages(200);

            if (this.alertSound) this.sound.play('laser');
        },
        initialMessages: function() {
            var messages = this.messages.models;
            for (var i = 0; i < messages.length; i++) {
                Private.addMessage.call(this, messages[i]);
            }
        },
        handleInputMessage: function() {
            var message = {
                message: this.$messageInput.val(),
                timestamp: Date.now(),
                user: this.mapper.get('name'),
                image: this.mapper.get('image')
            };
            this.$messageInput.val('');
            $(document).trigger(chatView.events.message + '-' + this.room, [message]);
        },
        addParticipant: function(participant) {
            var p = _.clone(participant.attributes);
            var html = this.participantTemplate(p);
            this.$participants.append(html);
        },
        removeParticipant: function(participant) {
            this.$container.find('.participant-' + participant.get('username')).remove();
        }
    };

    var Handlers = {
        buttonClick: function() {
            if (this.isOpen) this.close();
            else if (!this.isOpen) this.open();
        },
        videoToggleClick: function() {
            this.$videoToggle.toggleClass('active');
        },
        cursorToggleClick: function() {
            this.$cursorToggle.toggleClass('active');
        },
        soundToggleClick: function() {
            this.alertSound = !this.alertSound;
            this.$soundToggle.toggleClass('active');
        },
        keyUp: function(event) {
            switch(event.which) {
                case 13: // enter
                  Private.handleInputMessage.call(this);
                  break;
            }
        },
        inputFocus: function() {
            $(document).trigger(chatView.events.inputFocus);
        },
        inputBlur: function() {
            $(document).trigger(chatView.events.inputBlur);
        }
    };

    chatView = function(messages, mapper, room) {
        var self = this;

        this.room = room;
        this.mapper = mapper;
        this.messages = messages; // backbone collection

        this.isOpen = false;
        this.alertSound = false; // whether to play sounds on arrival of new messages or not
        this.unreadMessages = 0;
        this.participants = new Backbone.Collection();

        Private.templates.call(this);
        Private.createElements.call(this);
        Private.attachElements.call(this);
        Private.addEventListeners.call(this);
        Private.initialMessages.call(this);
        Private.initializeSounds.call(this);
    };

    chatView.prototype.addParticipant = function (participant) {
        this.participants.add(participant);
    }

    chatView.prototype.removeParticipant = function (username) {
        var p = this.participants.find(function (p) { return p.get('username') === username; });
        if (p) {
            this.participants.remove(p);
        }
    }

    chatView.prototype.removeParticipants = function () {
        this.participants.remove(this.participants.models);
    }

    chatView.prototype.open = function () {
        this.$container.css({
            right: '0'
        });
        this.$messageInput.focus();
        this.isOpen = true;
        this.unreadMessages = 0;
        this.$unread.hide();
        this.scrollMessages(0);
    }

    chatView.prototype.scrollMessages = function(duration) {
        duration = duration || 0;

        var
          numMessages = this.$messages.find('.chat-message').length,
          messageHeight = 52;

        this.$messages.animate({
            scrollTop: numMessages * messageHeight
        }, duration);
    }

    chatView.prototype.close = function () {
        this.$container.css({
            right: '-300px'
        });
        this.$messageInput.blur();
        this.isOpen = false;
    }

    chatView.prototype.remove = function () {
        this.$button.off();
        this.$container.remove();
    }

    /**
     * @class
     * @static
     */
    chatView.events = {
        message: 'ChatView:message',
        inputFocus: 'ChatView:inputFocus',
        inputBlur: 'ChatView:inputBlur'
    };

    return chatView;

})();

