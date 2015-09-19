var uuid = require('node-uuid');

module.exports = function(io, stunservers) {

    var
      activePeople = 0,
      activeRooms = {};

    function describeRoom(name) {
        var clients = io.sockets.clients(name);
        var result = {
            clients: {}
        };
        clients.forEach(function (client) {
            result.clients[client.id] = client.resources;
        });
        return result;
    }

    function safeCb(cb) {
        if (typeof cb === 'function') {
            return cb;
        } else {
            return function () {};
        }
    }

    io.sockets.on('connection', function (client) {
        activePeople += 1;

        client.on('setDetails', function (details) {
            client.profile = {
                username: details.username,
                image: details.image
            };
            client.broadcast.emit('presence', client.profile);
        });

        client.resources = {
            screen: false,
            video: true,
            audio: false
        };

        // pass a message to another id
        client.on('message', function (details) {
            if (!details) return;

            var otherClient = io.sockets.sockets[details.to];
            if (!otherClient) return;

            details.from = client.id;
            otherClient.emit('message', details);
        });

        client.on('shareScreen', function () {
            client.resources.screen = true;
        });

        client.on('unshareScreen', function (type) {
            client.resources.screen = false;
            removeFeed('screen');
        });

        client.on('join', join);

        client.on('requestRoomCount', function(name) {
            client.emit('room_count', {
                room_id: name,
                count: io.sockets.clients(name).length
            });
        });

        client.on('requestActiveRooms', function() {
            client.emit('rooms_count', Object.keys(activeRooms).length);
        });


        function removeFeed(type) {
            if (client.room) {
                io.sockets.in(client.room).emit('remove', {
                    id: client.id,
                    type: type
                });
                if (!type) {
                    client.leave(client.room);
                }
                io.sockets.emit('room_count', {
                    room_id: client.room,
                    count: io.sockets.clients(client.room).length
                });
                if (client.profile) {
                    client.broadcast.emit('vacated_room', {
                        room_id: client.room,
                        profile: client.profile
                    });
                }
                if (io.sockets.clients(client.room).length == 0) {
                    delete activeRooms[client.room];
                    io.sockets.emit('rooms_count', Object.keys(activeRooms).length);
                }
                if (!type) {
                    client.room = undefined;
                }
            }
        }

        function join(name, cb) {
            // sanity check
            if (typeof name !== 'string') return;
            // leave any existing rooms
            removeFeed();
            safeCb(cb)(null, describeRoom(name));
            client.join(name);
            io.sockets.emit('room_count', {
                room_id: name,
                count: io.sockets.clients(name).length
            });
            if (client.profile) {
                client.broadcast.emit('presence_room', {
                    room_id: name,
                    profile: client.profile
                });
            }
            io.sockets.clients(name).forEach(function (s) {
                if (s.profile) {
                    client.emit('presence_room', {
                        room_id: name,
                        profile: s.profile
                    });
                }
            });
            client.room = name;
            activeRooms[name] = true;
            io.sockets.emit('rooms_count', Object.keys(activeRooms).length);
        }

        // we don't want to pass "leave" directly because the
        // event type string of "socket end" gets passed too.
        client.on('disconnect', function () {
            removeFeed();
            activePeople -= 1;
            io.sockets.emit('users_count', activePeople);
            if (client.profile) {
                io.sockets.emit('vacated', client.profile);
            }
        });
        client.on('leave', function () {
            removeFeed();
        });

        client.on('create', function (name, cb) {
            if (arguments.length == 2) {
                cb = (typeof cb == 'function') ? cb : function () {};
                name = name || uuid();
            } else {
                cb = name;
                name = uuid();
            }
            // check if exists
            if (io.sockets.clients(name).length) {
                safeCb(cb)('taken');
            } else {
                join(name);
                safeCb(cb)(null, name);
            }
        });

        // tell client about stun and turn servers and generate nonces
        client.emit('stunservers', stunservers || []);

        client.emit('rooms_count', Object.keys(activeRooms).length);
        io.sockets.emit('users_count', activePeople);
        io.sockets.clients().forEach(function (socket) {
            if (socket.id !== client.id && socket.profile) client.emit('presence', socket.profile);
        });
    });
};