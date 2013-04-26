var io = require('socket.io').listen(5001),
    redis = require('redis').createClient();

redis.subscribe('maps');

io.on('connection', function(socket){
  redis.on('message', function(channel, message){
    var m = JSON.parse(message);
    var room;
    room = 'maps-' + m.mapid;
    
    socket.emit(room, m);
  });
});