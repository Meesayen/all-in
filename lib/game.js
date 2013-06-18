var
	EventEmitter = require("events").EventEmitter,
	Player = require('./player.js'),
	util = require("util");


var Game = function(o) {
	Game.super_.call(this);
	this.availableSeats = [
		'player1', 'player2', 'player3', 'player4'
	];
	this.players = {
		'player1': null,
		'player2': null,
		'player3': null,
		'player4': null
	};
	this.table = null;
	this.socket = null;

	this.INITIAL_BALANCE = 1000;

	this.init(o);
};

util.inherits(Game, EventEmitter);

Game.prototype.init = function(o) {
	this.socket = o.socket;
	this._initComms();
};
Game.prototype._initComms = function() {
	this.socket.on('disconnect', this._handleDisconnect.bind(this));
};
Game.prototype.addPlayer = function(socket) {
	var id = this.availableSeats.shift();
	if(id !== undefined) {
		var player = new Player({
			socket: socket,
			id: id,
			nickname: 'Player ' + (id.substr(-1)),
			balance: this.INITIAL_BALANCE
		});

		this.players[id] = player;

		this.socket.emit('game:newplayer', {
			id: player.id,
			nickname: player.nickname
		});

		player.on('disconnection', this._handlePlayerDisconnection.bind(this));
		player.on('update', this._handlePlayerInfoUpdate.bind(this));
	}
};
Game.prototype.removePlayer = function(id) {
	this.availableSeats.unshift(id);
	this.players[id] = null;

	this.socket.emit('game:playerleft', {
		id: id
	});
};
Game.prototype.getAvailableSeats = function() {
	return this.availableSeats.length;
};
Game.prototype._handleDisconnect = function(socket) {
	console.log('game disconnection');
};
Game.prototype._handlePlayerDisconnection = function(data) {
	this.removePlayer(data.id);
};
Game.prototype._handlePlayerInfoUpdate = function(data) {
	this.socket.emit('player:info-update', data);
};


module.exports = Game;
