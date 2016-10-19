
import {
  // server sendable, client receivable
  TOPIC_UPDATED,
  TOPIC_DELETED,
  SYNAPSE_UPDATED,
  SYNAPSE_DELETED,
  LIVE_MAPS_RECEIVED,
  MAP_WENT_LIVE,
  MAP_CEASED_LIVE,
  MAP_UPDATED,

  // server receivable, client sendable
  REQUEST_LIVE_MAPS,
  JOIN_MAP,
  LEAVE_MAP,
  UPDATE_TOPIC,
  DELETE_TOPIC,
  UPDATE_SYNAPSE,
  DELETE_SYNAPSE,
  UPDATE_MAP
} from '../frontend/src/Metamaps/Realtime/events'

const adjustAndBroadcast = (io, socket, state, event, data) => {
  if (event === JOIN_MAP) {
    if (!state.liveMaps[data.mapid]) {
      state.liveMaps[data.mapid] = data.map // { name: '', desc: '', numTopics: '' }
      state.liveMaps[data.mapid].mapper_count = 1
      io.sockets.emit(MAP_WENT_LIVE, state.liveMaps[data.mapid])
    }
    else {
      state.liveMaps[data.mapid].mapper_count++
    }
  }
  else if (event === LEAVE_MAP) {
    const mapid = socket.mapid
    if (state.liveMaps[mapid] && state.liveMaps[mapid].mapper_count == 1) {
      delete state.liveMaps[mapid]
      io.sockets.emit(MAP_CEASED_LIVE, { id: mapid })
    }
    else if (state.liveMaps[mapid]) {
      state.liveMaps[mapid].mapper_count--
    }
  }
}

module.exports = function (io, state) {
  io.on('connection', function (socket) {

    socket.on(REQUEST_LIVE_MAPS, function (activeUser) {
      //constrain response to maps visible to user
      var maps = Object.keys(state.liveMaps).map(function(key) { return state.liveMaps[key] })
      socket.emit(LIVE_MAPS_RECEIVED, maps)
    })

    socket.on(JOIN_MAP, data => adjustAndBroadcast(io, socket, state, JOIN_MAP, data))
    socket.on(LEAVE_MAP, () => adjustAndBroadcast(io, socket, state, LEAVE_MAP))
    socket.on('disconnect', () => adjustAndBroadcast(io, socket, state, LEAVE_MAP))

    socket.on(UPDATE_TOPIC, function (data) {
      socket.broadcast.emit(TOPIC_UPDATED, data)
    })

    socket.on(DELETE_TOPIC, function (data) {
      socket.broadcast.emit(TOPIC_DELETED, data)
    })

    socket.on(UPDATE_SYNAPSE, function (data) {
      socket.broadcast.emit(SYNAPSE_UPDATED, data)
    })

    socket.on(DELETE_SYNAPSE, function (data) {
      socket.broadcast.emit(SYNAPSE_DELETED, data)
    })

    socket.on(UPDATE_MAP, function (data) {
      socket.broadcast.emit(MAP_UPDATED, data)
    })
  })
}
