'use strict'

var express = require('express')
// var GameServer = require('./src/server/game-server.js')
// var server = require('http').Server(app)
// var io = require('socket.io')(server)

var app = express()

var PORT = 3000

app.set('view engine', 'jade')

// set templates location
app.set('views', `${__dirname}/views/`)


// serve static files
// app.use(express.static('dist/'))


// app.use('/', require('./src/server/routes').router)

// Configuration needed by the AppFog PaaS
// io.configure(function () {
// 	io.set("transports", ["xhr-polling"])
// 	io.set("polling duration", 10)
// })

// new GameServer(io).init()

module.exports = {
  // http: server,
  app,
  PORT,
  express
}
