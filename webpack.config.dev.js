var webpack = require('webpack')
var baseConf = require('./webpack.config.js')
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

var config = Object.create(baseConf)
config.debug = true

config.entry = {
  guest: ['./src/client/guest.js', hotMiddlewareScript],
  host: ['./src/client/host.js', hotMiddlewareScript]
}

config.devtool = '#source-map'

config.output.publicPath = 'http://localhost:3000/'

config.module.loaders.push({
  test: /\.module\.css$/,
  loaders: [
    'style-loader',
    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!'
  ]
})

config.plugins.push(
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': true,
    'process.env': {
      'NODE_ENV': JSON.stringify('development')
    }
  })
)

module.exports = config
