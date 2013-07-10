var
	EventEmitter = require("events").EventEmitter,
	Game = require('./game.js'),
	Hashids = require('hashids'),
	seeds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789',
	hashids = new Hashids('Pwning Pwnies Total Pwnage', 5, seeds),
	util = require("util");


var GameServer = function(ws) {
	GameServer.super_.call(this);
	this.ws = ws;
	this.games = {};
};

util.inherits(GameServer, EventEmitter);

GameServer.prototype.init = function() {
	this._initComms();
};
GameServer.prototype._initComms = function() {
	this.ws.sockets.on('connection', this._handleSocketConnection.bind(this));
};
GameServer.prototype._handleSocketConnection = function(socket) {
	socket.on('web:connection', function(data) {
		this._handleDesktopConnection(socket, data);
	}.bind(this));
	socket.on('device:connection', function(data) {
		this._handleDeviceConnection(socket, data);
	}.bind(this));
};
GameServer.prototype._handleDesktopConnection = function(socket, data) {
	var d = new Date();
	var id = hashids.encrypt(parseInt('1' + d.getMinutes() + '' + d.getSeconds()));
	var game = new Game({
		socket: socket
	});
	this.games[id] = game;
	socket.emit('game:tokenized', {token: id});
};
GameServer.prototype._handleDeviceConnection = function(socket, data) {
	var game = this.games[data.token];
	if (game === undefined) {
		socket.emit('game:wrongtoken', {
			message: 'Wrong Token'
		});
	} else {
		if(game.getAvailableSeats() == 0) {
			socket.emit('game:lobbyfull', {
				message: 'The Lobby is currently full.' +
					'<br>Only 4 players at once are allowed to join in.'
			});
		} else {
			game.addPlayer(socket);
		}
	}
};


module.exports = GameServer;
