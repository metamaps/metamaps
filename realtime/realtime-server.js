var
  io = require('socket.io').listen(5001),
  signalServer = require('./signal'),
  stunservers = [{"url": "stun:stun.l.google.com:19302"}];

io.set('log', false);

function start() {
    var livemaps = {}

    signalServer(io, stunservers);

    io.on('connection', function (socket) {
 
        socket.on('requestLiveMaps', function (activeUser) {
            //constrain response to maps visible to user
            var maps = Object.keys(livemaps).map(function(key) { return livemaps[key] })
            socket.emit('receiveLiveMaps', maps)
        })
        // this will ping a new person with awareness of who's already on the map
        socket.on('updateNewMapperList', function (data) {
            var existingUser = {
                userid: data.userid,
                username: data.username,
                userrealtime: data.userrealtime,
                userinconversation: data.userinconversation,
                userimage: data.userimage
            };
            socket.broadcast.emit(data.userToNotify + '-' + data.mapid + '-UpdateMapperList', existingUser);
        });

        // as a new mapper check whether there's a call in progress to join
        socket.on('checkForCall', function (data) {
          var socketsInRoom = io.sockets.clients(data.room);
          if (socketsInRoom.length) socket.emit('maps-' + data.mapid + '-callInProgress');
        });
        // send the invitation to start a call
        socket.on('inviteACall', function (data) {
          socket.broadcast.emit(data.invited + '-' + data.mapid + '-invitedToCall', data.inviter);
        });
        // send an invitation to join a call in progress
        socket.on('inviteToJoin', function (data) {
          socket.broadcast.emit(data.invited + '-' + data.mapid + '-invitedToJoin', data.inviter);
        });
        // send response back to the inviter
        socket.on('callAccepted', function (data) {
          socket.broadcast.emit(data.inviter + '-' + data.mapid + '-callAccepted', data.invited);
          socket.broadcast.emit('maps-' + data.mapid + '-callStarting');
        });
        socket.on('callDenied', function (data) {
          socket.broadcast.emit(data.inviter + '-' + data.mapid + '-callDenied', data.invited);
        });
        socket.on('inviteDenied', function (data) {
          socket.broadcast.emit(data.inviter + '-' + data.mapid + '-inviteDenied', data.invited);
        });
        socket.on('mapperJoinedCall', function (data) {
          socket.broadcast.emit('maps-' + data.mapid + '-mapperJoinedCall', data.id);
        });
        socket.on('mapperLeftCall', function (data) {
          socket.broadcast.emit('maps-' + data.mapid + '-mapperLeftCall', data.id);
        });

        // this will ping everyone on a map that there's a person just joined the map
        socket.on('newMapperNotify', function (data) {
    
            if (!livemaps[data.mapid]) {
                livemaps[data.mapid] = data.map // { name: '', desc: '', numTopics: '' }
                livemaps[data.mapid].mapper_count = 1
                io.sockets.emit('map_went_live', livemaps[data.mapid])
            }
            else {
                livemaps[data.mapid].mapper_count++
            }
 
            socket.set('mapid', data.mapid);
            socket.set('userid', data.userid);
            socket.set('username', data.username);

            var newUser = {
                userid: data.userid,
                username: data.username,
                userimage: data.userimage
            };

            socket.broadcast.emit('maps-' + data.mapid + '-newmapper', newUser);
        });

        var end = function () {
 
            var socketUserName, socketUserID;
            socket.get('userid', function (err, id) {
                socketUserID = id;
            });
            socket.get('username', function (err, name) {
                socketUserName = name;
            });
            var data = {
                username: socketUserName,
                userid: socketUserID
            };
            socket.get('mapid', function (err, mapid) {
                if (livemaps[mapid] && livemaps[mapid].mapper_count == 1) {
                    delete livemaps[mapid]
                    io.sockets.emit('map_no_longer_live', { id: mapid })
                }
                else if (livemaps[mapid]) {
                    livemaps[mapid].mapper_count--
                }
                socket.broadcast.emit('maps-' + mapid + '-lostmapper', data);
            });
        };
        // this will ping everyone on a map that there's a person just left the map
        socket.on('disconnect', end);
        socket.on('endMapperNotify', end);

        socket.on('updateMapperCoords', function (data) {
            var peer = {
                userid: data.userid,
                usercoords: data.usercoords
            };

            socket.broadcast.emit('maps-' + data.mapid + '-updatePeerCoords', peer);
        });

        socket.on('topicDrag', function (data) {
            var mapId = data.mapid;
            delete data.mapid;

            socket.broadcast.emit('maps-' + mapId + '-topicDrag', data);
        });

        socket.on('newMessage', function (data) {
            var mapId = data.mapid;
            delete data.mapid;

            socket.broadcast.emit('maps-' + mapId + '-newMessage', data);
        });

        socket.on('newTopic', function (data) {
            var mapId = data.mapid;
            delete data.mapid;

            socket.broadcast.emit('maps-' + mapId + '-newTopic', data);
        });

        socket.on('topicChangeFromClient', function (data) {
            socket.broadcast.emit('topicChangeFromServer', data);
        });

        socket.on('synapseChangeFromClient', function (data) {
            socket.broadcast.emit('synapseChangeFromServer', data);
        });

        socket.on('mapChangeFromClient', function (data) {
            socket.broadcast.emit('mapChangeFromServer', data);
        });

        socket.on('deleteTopicFromClient', function (data) {
            socket.broadcast.emit('deleteTopicFromServer', data);
        });

        socket.on('removeTopic', function (data) {
            var mapId = data.mapid;
            delete data.mapid;

            socket.broadcast.emit('maps-' + mapId + '-removeTopic', data);
        });

        socket.on('newSynapse', function (data) {
            var mapId = data.mapid;
            delete data.mapid;

            socket.broadcast.emit('maps-' + mapId + '-newSynapse', data);
        });

        socket.on('deleteSynapseFromClient', function (data) {
            socket.broadcast.emit('deleteSynapseFromServer', data);
        });

        socket.on('removeSynapse', function (data) {
            var mapId = data.mapid;
            delete data.mapid;

            socket.broadcast.emit('maps-' + mapId + '-removeSynapse', data);
        });

    });
}

start();
