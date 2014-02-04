window.app.realtime =
  connect : () ->
    window.app.socket = io.connect('http://gentle-savannah-1303.herokuapp.com');
    window.app.socket.on 'connect', () ->
      subscribeToRooms()
      console.log('socket connected')