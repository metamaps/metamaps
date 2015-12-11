Metamaps.Views = Metamaps.Views || {};

Metamaps.Views.room = (function () {

    var ChatView = Metamaps.Views.chatView;
    var VideoView = Metamaps.Views.videoView;

    var room = function(opts) {
      var self = this;

      this.isActiveRoom = false;
      this.socket = opts.socket;
      this.webrtc = opts.webrtc;
      //this.roomRef = opts.firebase;
      this.room = opts.room;
      this.config = opts.config;
      this.peopleCount = 0;

      this.$myVideo = opts.$video;
      this.myVideo = opts.myVideoView;

      this.messages = new Backbone.Collection();
      this.currentMapper = new Backbone.Model({ name: opts.username, image: opts.image });
      this.chat = new ChatView(this.messages, this.currentMapper, this.room);

      this.videos = {};

      this.init();
    };

    room.prototype.join = function(cb) {
      this.isActiveRoom = true;
      this.webrtc.joinRoom(this.room, cb);
    }

    room.prototype.leave = function() {
      for (var id in this.videos) {
        this.removeVideo(id);
      }
      this.isActiveRoom = false;
      this.webrtc.leaveRoom();
      this.chat.removeParticipants();
      this.chat.clearMessages();
      this.messages.reset();
    }

    room.prototype.setPeopleCount = function(count) {
      this.peopleCount = count;
    }

    room.prototype.init = function () {
        var self = this;

        /*this.roomRef.child('messages').on('child_added', function (snap) {
          self.messages.add(snap.val());
        });*/

        $(document).on(VideoView.events.audioControlClick, function (event, videoView) {
          if (!videoView.audioStatus) self.webrtc.mute();
          else if (videoView.audioStatus) self.webrtc.unmute();
        });
        $(document).on(VideoView.events.videoControlClick, function (event, videoView) {
          if (!videoView.videoStatus) self.webrtc.pauseVideo();
          else if (videoView.videoStatus) self.webrtc.resumeVideo();
        });

        this.webrtc.webrtc.off('peerStreamAdded');
        this.webrtc.webrtc.off('peerStreamRemoved');
        this.webrtc.on('peerStreamAdded', function (peer) {
          if (self.isActiveRoom) {
              self.addVideo(peer);
          }
        });

        this.webrtc.on('peerStreamRemoved', function (peer) {
          if (self.isActiveRoom) {
              self.removeVideo(peer);
          }
        });

        this.webrtc.on('mute', function (data) {
          var v = self.videos[data.id];
          if (!v) return;

          if (data.name === 'audio') {
            v.audioStatus = false;
          }
          else if (data.name === 'video') {
            v.videoStatus = false;
            v.$avatar.show();
          }
          if (!v.audioStatus && !v.videoStatus) v.$container.hide();
        });
        this.webrtc.on('unmute', function (data) {
          var v = self.videos[data.id];
          if (!v) return;

          if (data.name === 'audio') {
            v.audioStatus = true;
          }
          else if (data.name === 'video') {
            v.videoStatus = true;
            v.$avatar.hide();
          }
          v.$container.show();
        });

        this.socket.on('addVideo', function (data) {
          var existingPeer = self.webrtc.webrtc.peers.find(function(p) { return p.id === data.id; });
          if (!existingPeer) {
            var peer = self.webrtc.webrtc.createPeer({
              id: data.id,
              type: 'video',
              enableDataChannels: true,
              receiveMedia: {
                mandatory: {
                  OfferToReceiveAudio: true,
                  OfferToReceiveVideo: true
                }
              }
            });
            peer.avatar = data.avatar;
            self.webrtc.emit('createdPeer', peer);
            peer.start();
            
            // the rest will happen automatically through the 'peerStreamAdded' event and associated event handlers
          }
        });

        var sendChatMessage = function (event, data) {
          self.sendChatMessage(data);
        };
        $(document).on(ChatView.events.message + '-' + this.room, sendChatMessage);
      }

      room.prototype.videoAdded = function (callback) {
          this._videoAdded = callback;
      }

      room.prototype.addVideo = function (peer) {
        var
          id = this.webrtc.getDomId(peer),
          video = attachMediaStream(peer.stream);
          v = new VideoView(video, null, id, false, { DOUBLE_CLICK_TOLERANCE: 200, avatar: peer.avatar });

        if (this._videoAdded) this._videoAdded(v);
        this.videos[peer.id] = v;
      }

      room.prototype.removeVideo = function (peer) {
          console.log('removeVideo', peer);
          var id = typeof peer == 'string' ? peer : peer.id;
          this.videos[id].remove();
          delete this.videos[id];
      }

      room.prototype.sendChatMessage = function (data) {
        var self = this;
          //this.roomRef.child('messages').push(data);
          console.log(data);
          var m = new Metamaps.Backbone.Message({
            message: data.message,
            resource_id: Metamaps.Active.Map.id,
            resource_type: "Map"
          });
          m.save(null, {
            success: function (model, response) {
              self.messages.add(model);
              $(document).trigger(room.events.newMessage, [model]);
            },
            error: function (model, response) {
              console.log('error!', response);
            }
          });
      }

    /**
     * @class
     * @static
     */
    room.events = {
        newMessage: "Room:newMessage"
    };

    return room;
})();