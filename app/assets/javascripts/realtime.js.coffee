window.app.realtime =
  connect : () ->
    window.app.socket = io.connect('http://metamaps.cc:5001');
    window.app.socket.on 'connect', () ->
      subscribeToRooms()
      console.log('socket connected')