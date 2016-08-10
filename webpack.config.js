const path = 'path'
const webpack = 'webpack'

const config = module.exports = {
  context: __dirname,
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${process.env.NODE_ENV || 'development'}"`
    })
  ],
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
