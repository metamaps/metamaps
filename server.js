const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const webpack = require('webpack')
const socketio = require('socket.io')
const { createServer } = require('http')
const webpackDevMiddleware = require('webpack-dev-middleware')
const apiProxyMiddleware = require('./apiProxyMiddleware')
const realtime = require('./realtime')
const port = process.env.PORT || 3000

const app = express()
const server = createServer(app)
const io = socketio(server)
realtime(io) // sets up the socketio event listeners

app.use(cookieParser())

// serve the whole public folder as static files
app.use(express.static(path.join(__dirname, 'public')))

const config = require('./webpack.config.js')
const compiler = webpack(config)
// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}))

// pass XMLHttpRequests
// through to the API
// anything which is the UI wanting to make requests to the API
app.use(apiProxyMiddleware)

// for any normal route
app.get('*', function (req, res) {
  // respond with the same html file
  // since the whole UI technically boots
  // from the React app and the javascript
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

// Serve the files on set port or port 3000.
server.listen(port, function () {
  console.log('Metamaps listening on port ' + port + '\n')
});