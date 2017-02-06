const webpack = require('webpack')

const NODE_ENV = process.env.NODE_ENV || 'development'

const plugins = [
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": `"${NODE_ENV}"`
  })
]
if (NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.DedupePlugin())
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }))
} else {
  // enable this to test for circular dependencies
  // const CircularDependencyPlugin = require('circular-dependency-plugin')
  // plugins.push(new CircularDependencyPlugin({
  //   exclude: /^node_modules\//,
  //   failOnError: true
  // }))
}

const devtool = NODE_ENV === 'production' ? undefined : 'cheap-module-eval-source-map'

module.exports = {
  context: __dirname,
  plugins,
  devtool,
  module: {
    preLoaders: [
      { test: /\.json$/, loader: 'json' }
    ],
    loaders: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory&retainLines=true'
      }
    ]
  },
  entry: {
    'metamaps.secret.bundle': './frontend/src/index.js'
  },
  output: {
    path: './app/assets/javascripts',
    filename: '[name].js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  }
}
