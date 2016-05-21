var path = require('path')

module.exports = {
  // entry point of our application
  entry: {
    guest: './src/client/guest.js',
    host: './src/client/host.js'
  },

  // where to place the compiled bundle
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].build.js'
  },
  module: {
    // `loaders` is an array of loaders to use.
    // here we are only configuring vue-loader
    loaders: [
      {
        test: /\.vue$/, // a regex for matching all files that end in `.vue`
        loader: 'vue'   // loader to use for matched files
      }
    ]
  }
}
