var
io = require('socket.io')(),
signalling = require('./signal'),
junto = require('./junto'), 
map = require('./map'),
global = require('./global'),
stunservers = [{"url": "stun:stun.l.google.com:19302"}]

var state = {
  connectedPeople: {},
  liveMaps: {}
}
signalling(io, stunservers, state)
junto(io, state)
map(io, state)
global(io, state)
io.listen(5001)

