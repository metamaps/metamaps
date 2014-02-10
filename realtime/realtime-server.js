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
var redis = require('redis').createClient();
    
//redis.auth(rtg.auth.split(":")[1], function() {
//    start();
//});

function start() {
  redis.subscribe('maps');

  io.on('connection', function(socket){
    redis.on('message', function(channel, message){
      console.log(message);
      var m = JSON.parse(message);
      var room;
      room = 'maps-' + m.mapid;
    
      socket.emit(room, m);
    });
  });
}

start();