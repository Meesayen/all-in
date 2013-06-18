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
	this.playersReady = 0;
	this.readystate = false;
	this.table = null;
	this.socket = null;

	this.MIN_PLAYERS = 2;
	this.INITIAL_BALANCE = 1000;
	this.GAME_PHASES = {
		IDLE: 100,
		INITIAL_BET: 200,
		FLOP: 300,
		TURN: 400,
		RIVER: 500
	};

	this.init(o);
};

util.inherits(Game, EventEmitter);

Game.prototype.init = function(o) {
	this.socket = o.socket;
	this._initComms();
};
Game.prototype._initComms = function() {
	this.socket.on('disconnect', this._handleDisconnect.bind(this));
	this.socket.on('game:start', this._handleGameStart.bind(this));
};
Game.prototype.addPlayer = function(socket) {
	var id = this.availableSeats.shift();
	if(id !== undefined) {
		var player = new Player({
			socket: socket,
			id: id,
			nickname: 'Player ' + (id.substr(-1)),
			balance: this.INITIAL_BALANCE,
			readystate: false
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
	if(this.playersReady >= this.MIN_PLAYERS) {
		if(!this.readystate) {
			this.socket.emit('game:ready-to-play');
			this.readystate = true;
		}
	} else {
		if(this.readystate) {
			this.socket.emit('game:not-ready-to-play');
			this.readystate = false;
		}
	}
}
Game.prototype._handleDisconnect = function(socket) {
	console.log('game disconnection');
};
Game.prototype._handlePlayerDisconnection = function(data) {
	if(this.players[data.id].readystate) { 
		this.playersReady--;
	}
	this.checkReadyPlayers();
	this.removePlayer(data.id);
};
Game.prototype._handlePlayerInfoUpdate = function(data) {
	this.socket.emit('player:info-update', data);
};
Game.prototype._handlePlayerReady = function(data) {
	this.playersReady++;
	this.checkReadyPlayers();
	this.socket.emit('player:ready', data);
};
Game.prototype._handleGameStart = function(data) {
	this.socket.emit('game:ack-start');
	for(var i in this.players) {
		var player = this.players[i];
		if(player != null) {
			player.socket.emit('game:ack-start');
		}
	}

	//TODO make token unavailable to ensure this session can't be joined anymore
}


module.exports = Game;
