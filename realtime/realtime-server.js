/*var http = require('http'),
    express = require('express'),
    port = process.env.PORT || 5001,
    app = express(),
    server = http.createServer(app).listen(port),
    io = require('socket.io').listen(server);
    
console.log(port);
    
app.configure(function() {
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      return next();
    });
}); */

//var rtg   = require("url").parse("redis://redistogo:0ca046a3d56533cc162e2447db383192@pearlfish.redistogo.com:9060/"),
//redis = require('redis').createClient(rtg.port, rtg.hostname, {no_ready_check: true});

var io = require('socket.io').listen(5001);
//var redis = require('redis').createClient();

//redis.auth(rtg.auth.split(":")[1], function() {
//    start();
//});

function start() {
    //redis.subscribe('maps');

    io.on('connection', function (socket) {

        // this will ping everyone on a map with updates to the map
        /*redis.on('message', function (channel, message) {
            console.log(message);
            var m = JSON.parse(message);
            var room = 'maps-' + m.mapid;

            socket.emit(room, m);
        });*/

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

        // this will ping everyone on a map that there's a person just left the map
        socket.on('disconnect', function () {
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
        });
        
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

    });
}

start();