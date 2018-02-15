const webpack = require('webpack')

const NODE_ENV = process.env.NODE_ENV || 'development'

const plugins = [
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": `"${NODE_ENV}"`
  }),
  new webpack.IgnorePlugin(/^mock-firmata$/), // work around bindings.js error
  new webpack.ContextReplacementPlugin(/bindings$/, /^$/) // work around bindings.js error
]
const externals = ["bindings"] // work around bindings.js error

if (NODE_ENV === 'production') {
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
  externals,
  devtool,
  module: {
    loaders: [
      {
        test: /\.json$/, loader: 'json-loader'
      },
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory&retainLines=true'
      }
    ]
  },
  entry: {
    'metamaps.bundle': './src/index.js'
  },
	devServer: {
	  contentBase: './public'
	},
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    publicPath: '/'
  }
}
