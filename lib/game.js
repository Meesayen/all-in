var
	EventEmitter = require("events").EventEmitter,
	Player = require('./player.js'),
	Deck = require('./deck.js'),
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
	this.playersInGame = 0;

	this.deck = null;

	this.socket = null;

	this.MIN_PLAYERS = 2;
	this.INITIAL_BALANCE = 1000;
	this.GAME_PHASES = {
		LOBBY: 0,
		IDLE: 100,
		INITIAL_BET: 200,
		FLOP: 300,
		TURN: 400,
		RIVER: 500,
		RESULT: 600
	};
	this.currentPhase = this.GAME_PHASES.LOBBY;

	this.init(o);
};

util.inherits(Game, EventEmitter);

Game.prototype.init = function(o) {
	this.socket = o.socket;
	this.deck = new Deck();
	this._initComms();
};
Game.prototype._initComms = function() {
	this.socket.on('disconnect', this._handleDisconnect.bind(this));
	this.socket.on('game:start', this._handleGameStart.bind(this));
};
Game.prototype.addPlayer = function(socket) {
	this.playersInGame++;
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
		player.on('ready', this._handlePlayerReady.bind(this));
	}
};
Game.prototype.removePlayer = function(id) {
	this.playersInGame--;
	this.availableSeats.unshift(id);
	this.players[id] = null;

	this.socket.emit('game:playerleft', {
		id: id
	});
};
Game.prototype.getAvailableSeats = function() {
	return this.availableSeats.length;
};
Game.prototype.checkReadyPlayers = function() {
	var ready = true;
	if(this.playersInGame >= this.MIN_PLAYERS) {
		for (var k in this.players) {
			var player = this.players[k];
			if (player && !player.ready) {
				ready = false;
				break;
			}
		}
	} else {
		ready = false;
	}
	if(ready) {
		this.socket.emit('game:ready-to-play');
		this._changePhase(this.GAME_PHASES.IDLE);
	} else {
		this.socket.emit('game:not-ready-to-play');
		this._changePhase(this.GAME_PHASES.LOBBY);
	}
}
Game.prototype._handleDisconnect = function(socket) {
	console.log('game disconnection');
};
Game.prototype._handlePlayerDisconnection = function(player) {
	this.removePlayer(player.id);
	this.checkReadyPlayers();
};
Game.prototype._handlePlayerInfoUpdate = function(player) {
	this.socket.emit('player:info-update', player);
};
Game.prototype._handlePlayerReady = function(player) {
	this.checkReadyPlayers();
	this.socket.emit('player:ready', player);
};
Game.prototype._changePhase = function(phase) {
	this.currentPhase = phase;
};
Game.prototype._handleGameStart = function(data) {
	for(var i in this.players) {
		var player = this.players[i];
		if(player != null) {
			player.socket.emit('game:ack-start');
		}
	}
	this.socket.emit('game:ack-start');

	//TODO make token unavailable to ensure this session can't be joined anymore
}


module.exports = Game;
