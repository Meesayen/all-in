var
	EventEmitter = require("events").EventEmitter,
	util = require("util");


var Player = function(o) {
	Player.super_.call(this);
	this.id = null;
	this.nickname = null;
	this.balance = null;
	this.socket = null;
	this.ready = false;

	this.GAME_PHASES = {
		LOBBY: 0,
		IDLE: 100,
		WAITING: 200,
		BETTING: 300,
		BET_DONE: 400,
		FOLDED: 500
	};
	this.currentPhase = this.GAME_PHASES.LOBBY;

	this.init(o);
};

util.inherits(Player, EventEmitter);

Player.prototype.init = function(o) {
	this.id = o.id;
	this.nickname = o.nickname;
	this.balance = o.balance;
	this.socket = o.socket;
	this.cards = [];

	this.socket.emit('game:connected', {
		nickname: this.nickname,
		balance: this.balance,
		id: this.id
	});
	this._initComms();
};
Player.prototype._initComms = function() {
	this.socket.on('disconnect', this._handleDisconnect.bind(this));
	this.socket.on('player:ready', this._handleReady.bind(this));
	this.socket.on('player:info-update', this._handleInfoUpdate.bind(this));

	// Game actions
	this.socket.on('player:call', this._handleCall.bind(this));
	this.socket.on('player:raise', this._handleRaise.bind(this));
	this.socket.on('player:fold', this._handleFold.bind(this));
};
Player.prototype._changePhase = function(phase) {
	this.currentPhase = phase;
	switch (phase) {
		case this.GAME_PHASES.LOBBY:
			break;
		case this.GAME_PHASES.IDLE:
			break;
		case this.GAME_PHASES.WAITING:
			this.socket.emit('player:wait-to-bet');
			break;
		case this.GAME_PHASES.BETTING:
			this.socket.emit('player:my-turn');
			break;
		case this.GAME_PHASES.BET_DONE:
			this.socket.emit('player:ack-bet');
			break;
		case this.GAME_PHASES.FOLDED:
			this.socket.emit('player:ack-fold');
			break;
	}
};
Player.prototype._handleDisconnect = function(socket) {
	this.emit('disconnection', {
		id: this.id
	});
};
Player.prototype._handleReady = function(data) {
	this.ready = true;
	this.emit('ready', {
		id: this.id
	});
	this.socket.emit('player:ack-ready');
};
Player.prototype._handleInfoUpdate = function(data) {
	this.nickname = data.nickname;
	this.emit('update', {
		id: this.id,
		nickname: this.nickname
	});
};
Player.prototype.handleGameStart = function() {
	this.socket.emit('game:start');
	this.cards = [];
};

Player.prototype.setState = function(state) {
	this._changePhase(state);
};
Player.prototype.doSmallBlind = function(amount) {
};
Player.prototype.doBigBlind = function(amount) {
};

Player.prototype.takeCard = function(card) {
	this.cards.push(card);
	this.socket.emit('player:new-card', card);
};

Player.prototype._handleCall = function() {
	this.emit('call', this);
	this._changePhase(this.GAME_PHASES.BET_DONE);
};
Player.prototype._handleRaise = function(amount) {
	this.emit('raise', {
		amount: amount
	});
	this._changePhase(this.GAME_PHASES.BET_DONE);
};
Player.prototype._handleFold = function(data) {
	this.emit('fold');
	this._changePhase(this.GAME_PHASES.FOLDED);
};


module.exports = Player;
