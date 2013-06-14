
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


// Configuration needed by the AppFog PaaS
// io.configure(function () {
// 	io.set("transports", ["xhr-polling"]);
// 	io.set("polling duration", 10);
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
		socket.on('device:disconnection', function(data) {
			this._handleDeviceDisconnection(socket, data);
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
	},
	_handleDeviceDisconnection: function(socket, data) {
		var game = this.games[data.token];
		if (game === undefined) {
			socket.emit('game:wrongtoken');
		} else {
			game.removePlayer(data.id);
		}
	}
};


var Game = function(socket) {
	this.availableSeats = ['player1', 'player2', 'player3', 'player4'];
	this.players = {'player1': null, 'player2': null, 'player3': null, 'player4': null};
	this.table = null;
	this.socket = socket;
};
Game.prototype = {
	init: function() {
		this._initComms();
	},
	addPlayer: function(player) {
		var p = this.availableSeats.shift();
		if(p !== undefined) {
			player.id = p;
			player.nickname = 'Player ' + (p.substr(-1));
			this.players[p] = player;

			this.socket.emit('game:newplayer', {
				id: player.id,
				nickname: player.nickname
			});
		} else {
			console.log('no available seats');
		}
	},
	removePlayer: function(id) {
		this.availableSeats.unshift(id);
		this.players[id] = null;

		this.socket.emit('game:playerleft', {
			id: player.id,
			nickname: player.nickname
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
	this.id = null;
	this.nickname = null;
	this.balance = 1000;
	this.socket = socket;
};
Player.prototype = {
	init: function() {
		this._initComms();
	},
	_initComms: function() {
		this.socket.on('disconnect', this._handleDisconnect.bind(this));
	},
	_handleDisconnect: function(socket) {
		this.socket.emit('device:disconnection', {
			id: this.id
		});
		console.log('player disconnection');
	}
};


new GameServer(io).init();
