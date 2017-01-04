const {
  // server sendable, client receivable
  JUNTO_UPDATED,

  // server receivable, client sendable
  JOIN_CALL,
  LEAVE_CALL,
  JOIN_MAP,
  LEAVE_MAP
} = require('../frontend/src/Metamaps/Realtime/events')

module.exports = function(io, store) {
  store.subscribe(() => {
    console.log(store.getState())
    io.sockets.emit(JUNTO_UPDATED, store.getState())
  })

  io.on('connection', function(socket) {
    io.sockets.emit(JUNTO_UPDATED, store.getState())

    socket.on(JOIN_MAP, data => store.dispatch({ type: JOIN_MAP, payload: data }))
    socket.on(LEAVE_MAP, () => store.dispatch({ type: LEAVE_MAP, payload: socket }))
    socket.on(JOIN_CALL, data => store.dispatch({ type: JOIN_CALL, payload: data }))
    socket.on(LEAVE_CALL, () => store.dispatch({ type: LEAVE_CALL, payload: socket }))
    socket.on('disconnect', () => store.dispatch({ type: 'DISCONNECT', payload: socket }))
  })
}
