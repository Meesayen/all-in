'use strict'

var express = require('express')
var webpack = require('webpack')
var conf = require('./webpack.config.dev.js')
// var GameServer = require('./src/server/game-server.js')
// var server = require('http').Server(app)
// var io = require('socket.io')(server)

var app = express()
var compiler = webpack(conf)

var PORT = 3000

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: conf.output.publicPath,
  stats: {
    colors: true
  }
}))

app.use(require('webpack-hot-middleware')(compiler))

// serve static files
// app.use(express.static('dist/'))

app.set('view engine', 'jade')

// set templates location
app.set('views', `${__dirname}/views/`)

app.get('*', (req, res) => {
  let ua = req.header('user-agent')
  if (/mobile|nexus\s7/i.test(ua)) {
    res.render('mobile', { title: 'All In', message: 'mobile page' })
  } else {
    res.render('desktop', { title: 'All In', message: 'desktop page' })
  }
})

// app.use('/', require('./src/server/routes').router)

// Configuration needed by the AppFog PaaS
// io.configure(function () {
// 	io.set("transports", ["xhr-polling"])
// 	io.set("polling duration", 10)
// })

// new GameServer(io).init()

app.listen(PORT, 'localhost', err => {
  if (err) {
    console.log(err)
    return
  }

  console.log(`Listening at http://localhost:${PORT}`)
})

module.exports = {
  // http: server,
  app,
  PORT
}
