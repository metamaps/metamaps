var
io = require('socket.io').listen(5001),
signalServer = require('./signal'),
stunservers = [{"url": "stun:stun.l.google.com:19302"}]

import {
  // server sendable, client receivable
  INVITED_TO_CALL,
  INVITED_TO_JOIN,
  CALL_ACCEPTED,
  CALL_DENIED,
  INVITE_DENIED,
  CALL_IN_PROGRESS,
  CALL_STARTED,
  MAPPER_JOINED_CALL,
  MAPPER_LEFT_CALL,
  MAPPER_LIST_UPDATED,
  NEW_MAPPER,
  LOST_MAPPER,
  MESSAGE_CREATED,
  TOPIC_DRAGGED,
  TOPIC_CREATED,
  TOPIC_UPDATED,
  TOPIC_REMOVED,
  TOPIC_DELETED,
  SYNAPSE_CREATED,
  SYNAPSE_UPDATED,
  SYNAPSE_REMOVED,
  SYNAPSE_DELETED,
  PEER_COORDS_UPDATED,
  LIVE_MAPS_RECEIVED,
  MAP_WENT_LIVE,
  MAP_CEASED_LIVE,
  MAP_UPDATED,

  // server receivable, client sendable
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
  REQUEST_MAPPER_INFO,
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
} from '../frontend/src/Metamaps/Realtime/events'

io.set('log', false)

function start() {
  var livemaps = {}

  signalServer(io, stunservers)

  io.on('connection', function (socket) {

    socket.on(REQUEST_LIVE_MAPS, function (activeUser) {
      //constrain response to maps visible to user
      var maps = Object.keys(livemaps).map(function(key) { return livemaps[key] })
      socket.emit(LIVE_MAPS_RECEIVED, maps)
    })

    // this will ping a new person with awareness of who's already on the map
    socket.on(SEND_MAPPER_INFO, function (data) {
      var existingUser = {
        userid: data.userid,
        username: data.username,
        userrealtime: data.userrealtime,
        userinconversation: data.userinconversation,
        userimage: data.userimage
      }
      //socket.broadcast.emit(data.userToNotify + '-' + data.mapid + '-UpdateMapperList', existingUser)
      socket.broadcast.emit(MAPPER_LIST_UPDATED, existingUser)
    })

    // as a new mapper check whether there's a call in progress to join
    socket.on(CHECK_FOR_CALL, function (data) {
      var socketsInRoom = io.sockets.clients(data.room)
      //if (socketsInRoom.length) socket.emit('maps-' + data.mapid + '-callInProgress')
      if (socketsInRoom.length) socket.emit(CALL_IN_PROGRESS)
    })

    // send the invitation to start a call
    socket.on(INVITE_A_CALL, function (data) {
      //socket.broadcast.emit(data.invited + '-' + data.mapid + '-invitedToCall', data.inviter)
      socket.broadcast.emit(INVITED_TO_CALL, data.inviter)
    })

    // send an invitation to join a call in progress
    socket.on(INVITE_TO_JOIN, function (data) {
      //socket.broadcast.emit(data.invited + '-' + data.mapid + '-invitedToJoin', data.inviter)
      socket.broadcast.emit(INVITED_TO_JOIN, data.inviter)
    })

    // send response back to the inviter
    socket.on(ACCEPT_CALL, function (data) {
      //socket.broadcast.emit(data.inviter + '-' + data.mapid + '-callAccepted', data.invited)
      //socket.broadcast.emit('maps-' + data.mapid + '-callStarting')
      socket.broadcast.emit(CALL_ACCEPTED, data.invited)
      socket.broadcast.emit(CALL_STARTED)
    })

    socket.on(DENY_CALL, function (data) {
      //socket.broadcast.emit(data.inviter + '-' + data.mapid + '-callDenied', data.invited)
      socket.broadcast.emit(CALL_DENIED, data.invited)
    })
    socket.on(DENY_INVITE, function (data) {
      //socket.broadcast.emit(data.inviter + '-' + data.mapid + '-inviteDenied', data.invited)
      socket.broadcast.emit(INVITE_DENIED, data.invited)
    })
    socket.on(JOIN_CALL, function (data) {
      //socket.broadcast.emit('maps-' + data.mapid + '-mapperJoinedCall', data.id)
      socket.broadcast.emit(MAPPER_JOINED_CALL, data.id)
    })
    socket.on(LEAVE_CALL, function (data) {
      //socket.broadcast.emit('maps-' + data.mapid + '-mapperLeftCall', data.id)
      socket.broadcast.emit(MAPPER_LEFT_CALL, data.id)
    })

    // this will ping everyone on a map that there's a person just joined the map
    socket.on(JOIN_MAP, function (data) {

      if (!livemaps[data.mapid]) {
        livemaps[data.mapid] = data.map // { name: '', desc: '', numTopics: '' }
        livemaps[data.mapid].mapper_count = 1
        io.sockets.emit(MAP_WENT_LIVE, livemaps[data.mapid])
      }
      else {
        livemaps[data.mapid].mapper_count++
      }

      socket.set('mapid', data.mapid)
      socket.set('userid', data.userid)
      socket.set('username', data.username)

      var newUser = {
        userid: data.userid,
        username: data.username,
        userimage: data.userimage
      }

      //socket.broadcast.emit('maps-' + data.mapid + '-newmapper', newUser)
      socket.broadcast.emit(NEW_MAPPER, newUser)
    })

    var end = function () {

      var socketUserName, socketUserID
      socket.get('userid', function (err, id) {
        socketUserID = id
      })
      socket.get('username', function (err, name) {
        socketUserName = name
      })
      var data = {
        username: socketUserName,
        userid: socketUserID
      }
      socket.get('mapid', function (err, mapid) {
        if (livemaps[mapid] && livemaps[mapid].mapper_count == 1) {
          delete livemaps[mapid]
          io.sockets.emit(MAP_CEASED_LIVE, { id: mapid })
        }
        else if (livemaps[mapid]) {
          livemaps[mapid].mapper_count--
        }
        // scope by map
        socket.broadcast.emit(LOST_MAPPER, data)
      })
    }
    // this will ping everyone on a map that there's a person just left the map
    socket.on('disconnect', end)
    socket.on(LEAVE_MAP, end)

    socket.on(SEND_COORDS, function (data) {
      var peer = {
        userid: data.userid,
        usercoords: data.usercoords
      }

      //socket.broadcast.emit('maps-' + data.mapid + '-updatePeerCoords', peer)
      socket.broadcast.emit(PEER_COORDS_UPDATED, peer)
    })

    socket.on(DRAG_TOPIC, function (data) {
      var mapId = data.mapid
      delete data.mapid

      //socket.broadcast.emit('maps-' + mapId + '-topicDrag', data)
      socket.broadcast.emit(TOPIC_DRAGGED, data)
    })

    socket.on(CREATE_MESSAGE, function (data) {
      var mapId = data.mapid
      delete data.mapid
      //socket.broadcast.emit('maps-' + mapId + '-newMessage', data)
      socket.broadcast.emit(MESSAGE_CREATED, data)
    })

    socket.on(CREATE_TOPIC, function (data) {
      var mapId = data.mapid
      delete data.mapid
      //socket.broadcast.emit('maps-' + mapId + '-newTopic', data)
      socket.broadcast.emit(TOPIC_CREATED, data)
    })

    socket.on(UPDATE_TOPIC, function (data) {
      socket.broadcast.emit(TOPIC_UPDATED, data)
    })

    socket.on(REMOVE_TOPIC, function (data) {
      var mapId = data.mapid
      delete data.mapid
      //socket.broadcast.emit('maps-' + mapId + '-removeTopic', data)
      socket.broadcast.emit(TOPIC_REMOVED, data)
    })

    socket.on(DELETE_TOPIC, function (data) {
      socket.broadcast.emit(TOPIC_DELETED, data)
    })

    socket.on(CREATE_SYNAPSE, function (data) {
      var mapId = data.mapid
      delete data.mapid
      //socket.broadcast.emit('maps-' + mapId + '-newSynapse', data)
      socket.broadcast.emit(SYNAPSE_CREATED, data)
    })

    socket.on(UPDATE_SYNAPSE, function (data) {
      socket.broadcast.emit(SYNAPSE_UPDATED, data)
    })

    socket.on(REMOVE_SYNAPSE, function (data) {
      var mapId = data.mapid
      delete data.mapid
      //socket.broadcast.emit('maps-' + mapId + '-removeSynapse', data)
      socket.broadcast.emit(SYNAPSE_REMOVED, data)
    })

    socket.on(DELETE_SYNAPSE, function (data) {
      //socket.broadcast.emit('deleteSynapseFromServer', data)
      socket.broadcast.emit(SYNAPSE_DELETED, data)
    })

    socket.on(UPDATE_MAP, function (data) {
      socket.broadcast.emit(MAP_UPDATED, data)
    })
  })
}

start()
