const io = require('socket.io')()
const signalling = require('./signal')
const junto = require('./junto')
const map = require('./map')
const global = require('./global')
const stunservers = [{'url': 'stun:stun.l.google.com:19302'}]

const { createStore } = require('redux')
const reducer = require('./reducer')

let store = createStore(reducer)

global(io, store)
signalling(io, stunservers, store)
junto(io, store)
map(io, store)

io.listen(5001)
