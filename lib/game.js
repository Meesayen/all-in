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
	this.INITIAL_BALANCE = 25000;
	this.GAME_PHASES = {
		current: 0,
		LOBBY: 0,
		READY_TO_PLAY: 1,
		IDLE: 2,
		PRE_FLOP: 3,
		FLOP: 4,
		TURN: 5,
		RIVER: 6,
		RESULT: 7
	};

	this.tableInfo = {
		minBet: 100,
		amount: 0
	};

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
			balance: this.INITIAL_BALANCE,
			table: this.tableInfo
		});

		this.players[id] = player;

		this.socket.emit('game:player-joined', {
			id: player.id,
			nickname: player.nickname,
			cash: player.balance
		});

		player.on('disconnection', this._handlePlayerDisconnection.bind(this));
		player.on('info-update', this._handlePlayerInfoUpdate.bind(this));
		player.on('ready', this._handlePlayerReady.bind(this));

		player.on('update', this._handlePlayerUpdate.bind(this));
		player.on('check', this._handlePlayerCheck.bind(this));
		player.on('call', this._handlePlayerCall.bind(this));
		player.on('raise', this._handlePlayerRaise.bind(this));
		player.on('all-in', this._handlePlayerAllIn.bind(this));
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

	if (ready && this.GAME_PHASES.current === this.GAME_PHASES.LOBBY) {
		this._changePhase(this.GAME_PHASES.READY_TO_PLAY);
	} else if (!ready && this.GAME_PHASES.current === this.GAME_PHASES.READY_TO_PLAY) {
		this._changePhase(this.GAME_PHASES.LOBBY);
	}
};
Game.prototype._handleDisconnect = function(socket) {
	console.log('game disconnection');
};
Game.prototype._handlePlayerDisconnection = function(player) {
	this.removePlayer(player.id);
	this.checkReadyPlayers();
	if (this.GAME_PHASES.current === this.GAME_PHASES.LOBBY) {
		// remove and check ready
	} else {
		// start idle timer
		// if the time runs up the P auto-folds and will be out until reconnection
	}
};
Game.prototype._handlePlayerInfoUpdate = function(player) {
	this.socket.emit('player:info-update', player);
};
Game.prototype._handlePlayerReady = function(player) {
	this.checkReadyPlayers();
	this.socket.emit('player:ready', player);
};
Game.prototype._changePhase = function(phase) {
	this.GAME_PHASES.current = phase;
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
		this._serveTurn();
		break;
	case this.GAME_PHASES.RIVER:
		this._serveRiver();
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
		player.setState(Player.STATES.WAITING);
		this.socket.emit('player:waiting', {id: player.id});
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

	this.tableInfo.amount += smallBlinder.doSmallBlind();
	this.tableInfo.amount += bigBlinder.doBigBlind();
	onTheShot.setState(Player.STATES.THINKING);
	this.socket.emit('player:thinking', {id: onTheShot.id});
};


/* Player Round Actions */

Game.prototype._handlePlayerUpdate = function(player) {
	this.socket.emit('player:update', player);
};

Game.prototype._handlePlayerCheck = function(player) {
	this.socket.emit('player:check', {id: player.id});
	if (this.GAME_PHASES.current === this.GAME_PHASES.PRE_FLOP) {
		this._changePhase(this.GAME_PHASES.FLOP);
	} else {
		var player = this._nextPlayer();
		if (player.state === Player.STATES.CHECK) {
			this._nextPhase();
		} else {
			player.setState(Player.STATES.THINKING);
			this.socket.emit('player:thinking', {id: player.id});
		}
	}
};
Game.prototype._handlePlayerCall = function(player) {
	this.socket.emit('player:call', {id: player.id});
	var player = this._nextPlayer();
	if (player.state === Player.STATES.BET_DONE) {
		this._nextPhase();
	} else {
		player.setState(Player.STATES.THINKING);
		this.socket.emit('player:thinking', {id: player.id});
	}
};
Game.prototype._handlePlayerRaise = function(player) {
	this.socket.emit('player:raise', {id: player.id, bet: player.bet});
	var player = this._nextPlayer();
	if (player.state === Player.STATES.BET_DONE) {
		this._nextPhase();
	} else {
		player.setState(Player.STATES.THINKING);
		this.socket.emit('player:thinking', {id: player.id});
	}
};
Game.prototype._handlePlayerAllIn = function(player) {};
Game.prototype._handlePlayerFold = function(player) {
	this.socket.emit('player:fold', {id: player.id});
	var player = this._nextPlayer();
	if (player.state === Player.STATES.BET_DONE) {
		this._nextPhase();
	} else {
		player.setState(Player.STATES.THINKING);
		this.socket.emit('player:thinking', {id: player.id});
	}
};


Game.prototype._handleEndTurn = function() {

};
Game.prototype._nextPhase = function() {
	if (this.GAME_PHASES.current === this.GAME_PHASES.RIVER) {
		this._handleEndTurn();
	} else {
		this._changePhase(this.GAME_PHASES.current + 1);
	}
};
Game.prototype._serveFlop = function() {
	for (var i = 0; i < 3; i++) {
		var card = this.deck.pick();
		this.table.cards.push(card);
	}
	this.socket.emit('game:draw-flop', this.table.cards);

	for (var i = 0, player; player = this.table.players[i]; i++) {
		player.setState(Player.STATES.WAITING);
		this.socket.emit('player:waiting', {id: player.id});
	}

	this.table.dealer = 0;
	var player = this._nextPlayer();
	player.setState(Player.STATES.THINKING);
	this.socket.emit('player:thinking', {id: player.id});
	console.log(this.table);
};
Game.prototype._serveTurn = function() {
	var card = this.deck.pick();
	this.table.cards.push(card);
	this.socket.emit('game:draw-turn', card);

	for (var i = 0, player; player = this.table.players[i]; i++) {
		player.setState(Player.STATES.WAITING);
		this.socket.emit('player:waiting', {id: player.id});
	}

	this.table.dealer = 0;
	var player = this._nextPlayer();
	player.setState(Player.STATES.THINKING);
	this.socket.emit('player:thinking', {id: player.id});
};
Game.prototype._serveRiver = function() {
	var card = this.deck.pick();
	this.table.cards.push(card);
	this.socket.emit('game:draw-river', card);

	for (var i = 0, player; player = this.table.players[i]; i++) {
		player.setState(Player.STATES.WAITING);
		this.socket.emit('player:waiting', {id: player.id});
	}

	this.table.currentPlayer = this.table.dealer;
	var player = this._nextPlayer();
	player.setState(Player.STATES.THINKING);
	this.socket.emit('player:thinking', {id: player.id});
};

Game.prototype._nextRound = function() {
	this.table.dealer++;
	this.table.currentPlayer = this.table.dealer;
	this.socket.emit('game:new-round');
};


module.exports = Game;
