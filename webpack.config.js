const path = require('path')
const webpack = require('webpack')

const NODE_ENV = process.env.NODE_ENV || 'development'

const plugins = [
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": `"${NODE_ENV}"`
  })
]
if (NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }))
}

const config = module.exports = {
  context: __dirname,
  plugins,
  module: {
    loaders: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loaders: [
          "babel-loader?cacheDirectory"
        ]
      }
    ]
  },
  entry: {
    'metamaps.bundle': './frontend/src/index.js'
  },
  output: {
    path: './app/assets/javascripts/webpacked',
    filename: '[name].js'
  }
}
