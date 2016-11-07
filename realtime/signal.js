const uuid = require('node-uuid')

// based off of https://github.com/andyet/signalmaster
// since it was updated to socket.io 1.3.7

function safeCb(cb) {
  if (typeof cb === 'function') {
    return cb
  } else {
    return function() {}
  }
}

module.exports = function(io, stunservers, state) {
  io.on('connection', function(socket) {
    socket.resources = {
      screen: false,
      video: true,
      audio: false
    }

    // pass a message to another id
    socket.on('message', function(details) {
      if (!details) return

      var otherClient = io.to(details.to)
      if (!otherClient) return

      details.from = socket.id
      otherClient.emit('message', details)
    })

    socket.on('shareScreen', function() {
      socket.resources.screen = true
    })

    socket.on('unshareScreen', function(type) {
      socket.resources.screen = false
      removeFeed('screen')
    })

    socket.on('join', join)

    function removeFeed(type) {
      if (socket.room) {
        io.sockets.in(socket.room).emit('remove', {
          id: socket.id,
          type: type
        })
        if (!type) {
          socket.leave(socket.room)
          socket.room = undefined
        }
      }
    }

    function join(name, cb) {
      // sanity check
      if (typeof name !== 'string') return
      // leave any existing rooms
      removeFeed()
      safeCb(cb)(null, describeRoom(name))
      socket.join(name)
      socket.room = name
    }

    // we don't want to pass "leave" directly because the
    // event type string of "socket end" gets passed too.
    socket.on('disconnect', function() {
      removeFeed()
    })
    socket.on('leave', function() {
      removeFeed()
    })

    socket.on('create', function(name, cb) {
      if (arguments.length === 2) {
        cb = (typeof cb === 'function') ? cb : function() {}
        name = name || uuid()
      } else {
        cb = name
        name = uuid()
      }
      // check if exists
      var room = io.nsps['/'].adapter.rooms[name]
      if (room && room.length) {
        safeCb(cb)('taken')
      } else {
        join(name)
        safeCb(cb)(null, name)
      }
    })

    // support for logging full webrtc traces to stdout
    // useful for large-scale error monitoring
    socket.on('trace', function(data) {
      console.log('trace', JSON.stringify(
        [data.type, data.session, data.prefix, data.peer, data.time, data.value]
      ))
    })
  })

  function describeRoom(name) {
    var adapter = io.nsps['/'].adapter
    var sockets = adapter.rooms[name] || {}
    var result = {
      clients: {}
    }
    Object.keys(sockets).forEach(function(id) {
      result.clients[id] = adapter.nsp.connected[id].resources
    })
    return result
  }
}
