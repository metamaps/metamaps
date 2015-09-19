


socket.emit('setDetails', {
  username: authData.twitter.username,
  image: authData.twitter.cachedUserProfile.profile_image_url
});

$target.append(room.chat.$container);
room.chat.open();













room.join(function (err, roomDesc) {

  attachMediaStream(webrtc.webrtc.localStream, localVideo.$video[0]);

  function addVideo(v) {
    // random position for now
    var top = Math.floor((Math.random() * ($target.height() - 100)) + 1);
    //var left = Math.floor((Math.random() * ($target.width() - 100)) + 1);
    var right = Math.floor((Math.random() * (468 - 100)) + 1);
    v.setParent($target);
    $target.append(v.$container);
    v.$container.css({
        top: top + 'px',
        right: right + 'px'
    });
  }

  room.videoAdded(addVideo);
  
  for (peer in room.videos) {
    addVideo(room.videos[peer]);
  }
});


C("localVideo", ["require", "exports", "module", "VideoView"], function (require, exports, module) {

  var VideoView = require("VideoView");

  function localVideo(opts, callback) {
    var
      $video = $('<video></video>').attr('id', opts.id),
      localVideo = {
        $video: $video,
        view: new VideoView($video[0], $('body'), 'me', true, { DOUBLE_CLICK_TOLERANCE: 200 }),     
      };
    return localVideo;
  }

  module.e = localVideo;
});




webrtc.on('readyToCall', function () {
  app.readyToCall = true;
  jQuery('body').append(localVideo.view.$container);
});


var
  ChatView = c('ChatView'),
  RoomTopicView = c('RoomTopicView'),
  IOconnection = c("ioconnection"),
  authUser = firebase.getAuth() || null,
  videoId = 'video-wrapper',
  localVideo = c("localVideo")({ id: videoId }),
  //socket = new IOconnection({ url: socketUrl }),
  webrtc = new SimpleWebRTC({
    connection: socket,
    localVideoEl: videoId,
    remoteVideosEl: '',
    detectSpeakingEvents: true,
    autoAdjustMic: true,
    autoRequestMedia: false,
    localVideo: {
        autoplay: true,
        mirror: true,
        muted: true
    },
    media: {
      video: true,
      audio: true
    }
  });
  app = {
    activeRoom: -1,
    stats: {
      activeRooms: 0,
      activePeople: 0
    },
    webrtc: webrtc,
    localVideo: localVideo,
    readyToCall: false,
    globalMessages: new Backbone.Collection(),
    globalChat: null
  };