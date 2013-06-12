
/**
 * Module dependencies.
 */

var
	express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	Hashids = require('hashids'),
	seeds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
	hashids = new Hashids('Pwning Pwnies Total Pwnage', 5, seeds),
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



// io.sockets.on('connection', function (socket) {
// 	socket.on('device:connection', function(data) {
// 		console.log(data.token);
// 	});
// });


server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});





var GameServer = function(ws) {
	this.ws = ws;
	this.games = {};
};
GameServer.prototype = {
	init: function() {
		this._initComms();
	},
	_initComms: function() {
		this.ws.sockets.on('connection', this._handleSocketConnection.bind(this));
	},
	_handleSocketConnection: function(socket) {
		socket.on('desktop:connection', function(data) {
			this._handleDesktopConnection(socket, data);
		}.bind(this));
		socket.on('device:connection', function(data) {
			this._handleDeviceConnection(socket, data);
		}.bind(this));
	},
	_handleDesktopConnection: function(socket, data) {
		var d = new Date();
		var id = hashids.encrypt(parseInt('1' + d.getMinutes() + '' + d.getSeconds()));
		var game = new Game(socket);
		this.games[id] = game;
		game.init();
		socket.emit('game:tokenized', {token: id});
	},
	_handleDeviceConnection: function(socket, data) {
		var game = this.games[data.token];
		if (game === undefined) {
			socket.emit('game:wrongtoken');
		} else {
			var player = new Player(socket);
			game.addPlayer(player);
		}
	}
};


var Game = function(socket) {
	this.players = [];
	this.table = null;
	this.socket = socket;
};
Game.prototype = {
	init: function() {
		this._initComms();
	},
	addPlayer: function(player) {
		player.nickname = 'Player ' + (this.players.length + 1);
		this.players.push(player);

		this.refreshPlayers();
	},
	refreshPlayers: function() {
		var nicknames = [];
		for (var i = 0, p; p = this.players[i]; i++) {
			nicknames.push(p.nickname);
		}
		this.socket.emit('game:newplayer', {
			players: nicknames
		});
	},
	_initComms: function() {
		this.socket.on('disconnect', this._handleDisconnect.bind(this));
	},
	_handleDisconnect: function(socket) {
		console.log('game disconnection');
	}
};


var Player = function(socket) {
	this.nickname = null;
	this.balance = 1000;
	this.socket = socket;
};
Player.prototype = {
	init: function() {

	}
};


new GameServer(io).init();
