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

	this.table = {
		players: [],
		cards: [],
		dealer: null,
		currentPlayer: null
	};

	this.socket = null;

	this.MIN_PLAYERS = 2;
	this.INITIAL_BALANCE = 1000;
	this.GAME_PHASES = {
		LOBBY: 0,
		READY_TO_PLAY: 90,
		IDLE: 100,
		PRE_FLOP: 200,
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
	this.socket.on('web:start', this._handleGameStart.bind(this));
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

		this.socket.emit('game:player-joined', {
			id: player.id,
			nickname: player.nickname
		});

		player.on('disconnection', this._handlePlayerDisconnection.bind(this));
		player.on('info-update', this._handlePlayerInfoUpdate.bind(this));
		player.on('ready', this._handlePlayerReady.bind(this));

		player.on('update', this._handlePlayerUpdate.bind(this));
		player.on('check', this._handlePlayerCheck.bind(this));
		player.on('call', this._handlePlayerCall.bind(this));
		player.on('raise', this._handlePlayerRaise.bind(this));
		player.on('fold', this._handlePlayerFold.bind(this));
	}
};
Game.prototype.removePlayer = function(id) {
	this.playersInGame--;
	this.availableSeats.unshift(id);
	this.players[id] = null;

	this.socket.emit('game:player-left', {
		id: id
	});
};
Game.prototype.getAvailableSeats = function() {
	return this.availableSeats.length;
};
Game.prototype.checkReadyPlayers = function() {
	var ready = true;
	if (this.playersInGame >= this.MIN_PLAYERS) {
		for (var k in this.players) {
			var player = this.players[k];
			console.log(player);
			if (player && player.ready === false) {
				ready = false;
				break;
			}
		}
	} else {
		ready = false;
	}

	if (ready && this.currentPhase === this.GAME_PHASES.LOBBY) {
		this._changePhase(this.GAME_PHASES.READY_TO_PLAY);
	} else if (!ready && this.currentPhase === this.GAME_PHASES.READY_TO_PLAY) {
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
	switch (phase) {
		case this.GAME_PHASES.LOBBY:
			this.socket.emit('game:not-ready-to-play');
			break;
		case this.GAME_PHASES.READY_TO_PLAY:
			this.socket.emit('game:ready-to-play');
			break;
		case this.GAME_PHASES.IDLE:
			break;
		case this.GAME_PHASES.PRE_FLOP:
			this._manageBlinds();
			break;
		case this.GAME_PHASES.FLOP:
			this._serveFlop();
			break;
		case this.GAME_PHASES.TURN:
			break;
		case this.GAME_PHASES.RIVER:
			break;
		case this.GAME_PHASES.RESULT:
			break;
	}
};

Game.prototype._nextPlayer = function() {
	this.table.currentPlayer++;
	if (this.table.currentPlayer === this.table.players.length) {
		this.table.currentPlayer = 0;
	}
	return this.table.players[this.table.currentPlayer];
};


/* Round Start Process */

Game.prototype._handleGameStart = function(data) {
	for (var i in this.players) {
		var player = this.players[i];
		if (player != null) {
			player.handleGameStart();
		}
	}
	this._startGame();

	//TODO make token unavailable to ensure this session can't be joined anymore
};

Game.prototype._startGame = function() {
	this.deck.shuffle();
	for (var k in this.players) {
		var player = this.players[k];
		if (player) {
			this.table.players.push(player);
		}
	}

	for (var i = 0, player; player = this.table.players[i]; i++) {
		player.takeCard(this.deck.pick());
		player.takeCard(this.deck.pick());
		player.setState(player.GAME_PHASES.WAITING);
	}

	this.table.dealer = 0;
	this.table.currentPlayer = 0;

	var playersInfo = [];
	for (var k in this.table.players) {
		var player = this.table.players[k];
		playersInfo.push({
			id: player.id,
			balance: player.balance,
			nickname: player.nickname,
			status: player.status
		});
	}

	this.socket.emit('game:start', {
		players: playersInfo
	});

	this._changePhase(this.GAME_PHASES.PRE_FLOP);
};

Game.prototype._manageBlinds = function() {
	var smallBlinder = this._nextPlayer();
	var bigBlinder = this._nextPlayer();
	var onTheShot = this._nextPlayer();

	smallBlinder.doSmallBlind();
	bigBlinder.doBigBlind();
	setTimeout(function() {
		onTheShot.setState(onTheShot.GAME_PHASES.BETTING);
	}, 100)
};


/* Player Round Actions */

Game.prototype._handlePlayerUpdate = function(player) {
	this.socket.emit('player:update', player);
};

Game.prototype._handlePlayerCheck = function(id) {
	this.socket.emit('player:check', {
		id: id
	});
	var player = this._nextPlayer();
	console.log(player.currentPhase);
	if (player.currentPhase === player.GAME_PHASES.BET_DONE) {
		this._changePhase(this.GAME_PHASES.FLOP)
	} else {
		player.setState(player.GAME_PHASES.BETTING);
	}
};
Game.prototype._handlePlayerCall = function(id) {
	this.socket.emit('player:call', {
		id: id
	});
	var player = this._nextPlayer();
	console.log(player.currentPhase);
	if (player.currentPhase === player.GAME_PHASES.BET_DONE) {
		this._changePhase(this.GAME_PHASES.FLOP)
	} else {
		player.setState(player.GAME_PHASES.BETTING);
	}
};
Game.prototype._handlePlayerRaise = function(data) {
	// TODO...
	var player = this._nextPlayer();
	if (player.currentPhase === player.GAME_PHASES.BET_DONE) {
		this._changePhase(this.GAME_PHASES.FLOP)
	} else {
		player.setState(player.GAME_PHASES.BETTING);
	}
};
Game.prototype._handlePlayerFold = function(id) {
	// TODO...
	var player = this._nextPlayer();
	if (player.currentPhase === player.GAME_PHASES.BET_DONE) {
		this._changePhase(this.GAME_PHASES.FLOP)
	} else {
		player.setState(player.GAME_PHASES.BETTING);
	}
};


Game.prototype._serveFlop = function() {
	for (var i = 0; i < 3; i++) {
		var card = this.deck.pick();
		this.table.cards.push(card);
	}
	this.socket.emit('game:draw-flop', this.table.cards);

	for (var i = 0, player; player = this.table.players[i]; i++) {
		player.setState(player.GAME_PHASES.WAITING);
	}

	this.table.currentPlayer = this.table.dealer;
	var player = this._nextPlayer();
	player.setState(player.GAME_PHASES.BETTING);
};

Game.prototype._nextRound = function() {
	this.table.dealer++;
	this.table.currentPlayer = this.table.dealer;
	this.socket.emit('game:new-round');
};


module.exports = Game;
