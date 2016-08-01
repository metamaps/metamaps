const path = 'path'
const webpack = 'webpack'

const config = module.exports = {
  context: __dirname,
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
    'metamaps.bundle': './src/index.js'
  },
  output: {
    path: '../app/assets/javascripts/webpacked',
    filename: '[name].js'
  }
}
