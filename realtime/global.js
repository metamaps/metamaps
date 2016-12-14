const {
  // server sendable, client receivable
  TOPIC_UPDATED,
  SYNAPSE_UPDATED,
  MAP_UPDATED,
  JUNTO_UPDATED,

  // server receivable, client sendable
  JOIN_CALL,
  LEAVE_CALL,
  JOIN_MAP,
  LEAVE_MAP,
  UPDATE_TOPIC,
  UPDATE_SYNAPSE,
  UPDATE_MAP
} = require('../frontend/src/Metamaps/Realtime/events')

module.exports = function(io, store) {
  store.subscribe(() => {
    io.sockets.emit(JUNTO_UPDATED, store.getState())
  })

  io.on('connection', function(socket) {
    io.sockets.emit(JUNTO_UPDATED, store.getState())

    socket.on(JOIN_MAP, data => store.dispatch({ type: JOIN_MAP, payload: data }))
    socket.on(LEAVE_MAP, () => store.dispatch({ type: LEAVE_MAP, payload: socket }))
    socket.on(JOIN_CALL, data => store.dispatch({ type: JOIN_CALL, payload: data }))
    socket.on(LEAVE_CALL, () => store.dispatch({ type: LEAVE_CALL, payload: socket }))
    socket.on('disconnect', () => store.dispatch({ type: 'DISCONNECT', payload: socket }))

    socket.on(UPDATE_TOPIC, function(data) {
      socket.broadcast.emit(TOPIC_UPDATED, data)
    })

    socket.on(UPDATE_SYNAPSE, function(data) {
      socket.broadcast.emit(SYNAPSE_UPDATED, data)
    })

    socket.on(UPDATE_MAP, function(data) {
      socket.broadcast.emit(MAP_UPDATED, data)
    })
  })
}
