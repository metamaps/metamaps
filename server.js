const path = require('path')
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const apiProxyMiddleware = require('./apiProxyMiddleware')
const port = process.env.PORT || 3000

const app = express();

app.use(express.static(path.join(__dirname, 'public')))

const config = require('./webpack.config.js');
const compiler = webpack(config);
// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}))

app.use(apiProxyMiddleware)

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

// Serve the files on set port or port 3000.
app.listen(port, function () {
  console.log('Metamaps listening on port ' + port + '\n')
});