var
  io = require('socket.io').listen(5001),
  signalServer = require('./signal'),
  stunservers = [{"url": "stun:stun.l.google.com:19302"}];

function start() {

    signalServer(io, stunservers);

    io.on('connection', function (socket) {

        // this will ping a new person with awareness of who's already on the map
        socket.on('updateNewMapperList', function (data) {
            var existingUser = {
                userid: data.userid,
                username: data.username,
                userrealtime: data.userrealtime,
                userimage: data.userimage
            };
            socket.broadcast.emit(data.userToNotify + '-' + data.mapid + '-UpdateMapperList', existingUser);
        });

        // this will ping everyone on a map that there's a person just joined the map
        socket.on('newMapperNotify', function (data) {
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
                socket.broadcast.emit('maps-' + mapid + '-lostmapper', data);
            });
        };
        // this will ping everyone on a map that there's a person just left the map
        socket.on('disconnect', end);
        socket.on('endMapperNotify', end);
        
        // this will ping everyone on a map that someone just turned on realtime
        socket.on('notifyStartRealtime', function (data) {
            var newUser = {
                userid: data.userid,
                username: data.username
            };

            socket.broadcast.emit('maps-' + data.mapid + '-newrealtime', newUser);
        });
        
        // this will ping everyone on a map that someone just turned on realtime
        socket.on('notifyStopRealtime', function (data) {
            var newUser = {
                userid: data.userid,
                username: data.username
            };

            socket.broadcast.emit('maps-' + data.mapid + '-lostrealtime', newUser);
        });

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