var
	EventEmitter = require("events").EventEmitter,
	util = require("util");


var Game = function(socket) {
	Game.super_.call(this);
	this.availableSeats = ['player1', 'player2', 'player3', 'player4'];
	this.players = {'player1': null, 'player2': null, 'player3': null, 'player4': null};
	this.table = null;
	this.socket = socket;

	this.init();
};

util.inherits(Game, EventEmitter);

Game.prototype.init = function() {
	this._initComms();
};
Game.prototype.addPlayer = function(player) {
	var p = this.availableSeats.shift();
	if(p !== undefined) {
		player.id = p;
		player.nickname = 'Player ' + (p.substr(-1));
		this.players[p] = player;

		this.socket.emit('game:newplayer', {
			id: player.id,
			nickname: player.nickname
		});

		player.on('disconnection', this._handlePlayerDisconnection.bind(this));
	} else {
		console.log('no available seats');
	}
};
Game.prototype.removePlayer = function(id) {
	this.availableSeats.unshift(id);
	this.players[id] = null;

	this.socket.emit('game:playerleft', {
		id: id
	});
};
Game.prototype._initComms = function() {
	this.socket.on('disconnect', this._handleDisconnect.bind(this));
};
Game.prototype._handleDisconnect = function(socket) {
	console.log('game disconnection');
};
Game.prototype._handlePlayerDisconnection = function(data) {
	this.removePlayer(data.id);
};


module.exports = Game;
