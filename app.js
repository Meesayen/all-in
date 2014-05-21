/**
 * Module dependencies.
 */

var
	express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	GameServer = require('./lib/game-server.js'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);


// Configuration needed by the AppFog PaaS
// io.configure(function () {
// 	io.set("transports", ["xhr-polling"]);
// 	io.set("polling duration", 10);
// });

server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});


new GameServer(io).init();
