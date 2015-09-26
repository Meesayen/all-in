require('babel/register')({
  whitelist: ['es6.modules', 'strict']
});

var
  express = require('express'),
  app = express(),
  GameServer = require('./src/server/game-server.js'),
  server = require('http').Server(app),
  io = require('socket.io')(server);

module.exports = {
  http: server,
  app: app
};

// serve static files
app.use(express.static('dist/'));

app.set('view engine', 'jade');

// set templates location
app.set('views', __dirname + '/views/');

app.use('/', require('./src/server/routes').router);

// Configuration needed by the AppFog PaaS
// io.configure(function () {
// 	io.set("transports", ["xhr-polling"]);
// 	io.set("polling duration", 10);
// });

new GameServer(io).init();
