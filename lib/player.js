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
	this.state = null;
	this.table = null;
	this.init(o);
};

// Player Games States
Player.STATES = {
	LOBBY: 0,
	IDLE: 1,
	WAITING: 2,
	THINKING: 3,
	BET_DONE: 4,
	SMALL_BLIND: 5,
	BIG_BLIND: 6,
	FOLDED: 7
};

util.inherits(Player, EventEmitter);

Player.prototype.init = function(o) {
	this.state = Player.STATES.LOBBY;
	this.id = o.id;
	this.nickname = o.nickname;
	this.balance = o.balance;
	this.socket = o.socket;
	this.cards = [];
	this.table = o.table;

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
	this.socket.on('player:check', this._handleCheck.bind(this));
	this.socket.on('player:call', this._handleCall.bind(this));
	this.socket.on('player:raise', this._handleRaise.bind(this));
	this.socket.on('player:fold', this._handleFold.bind(this));
};

Player.prototype._changeState = function(state) {
	this.state = state;
	switch (state) {
	case Player.STATES.LOBBY:
		break;
	case Player.STATES.IDLE:
		break;
	case Player.STATES.WAITING:
		this.socket.emit('player:wait-to-bet');
		break;
	case Player.STATES.THINKING:
		this.socket.emit('player:my-turn');
		break;
	case Player.STATES.SMALL_BLIND:
		this.socket.emit('player:my-turn', {state: 'small-blind'});
		break;
	case Player.STATES.BIG_BLIND:
		this.socket.emit('player:my-turn', {state: 'big-blind'});
		break;
	case Player.STATES.BET_DONE:
		this.socket.emit('player:ack-bet');
		break;
	case Player.STATES.FOLDED:
		this.socket.emit('player:ack-fold');
		break;
	}
};
Player.prototype._handleDisconnect = function(socket) {
	this.emit('disconnection', {
		id: this.id
	});
};
Player.prototype._handleReady = function() {
	this.ready = true;
	this.emit('ready', {
		id: this.id
	});
	this.socket.emit('player:ack-ready');
};
Player.prototype._handleInfoUpdate = function(data) {
	this.nickname = data.nickname;
	this.emit('update', this._getInfo());
};
Player.prototype._emitUpdate = function() {
	this.emit('update', {
		id: this.id,
		balance: this.balance,
		nickname: this.nickname,
		status: this.status
	});
};

Player.prototype.handleGameStart = function() {
	this.socket.emit('game:start');
	this.cards = [];
};

Player.prototype.setState = function(state) {
	this._changeState(state);
};
Player.prototype.doSmallBlind = function() {
	var bet = this.table.minBet / 2;
	var info = this._getInfo();
	this.balance -= bet;
	info.bet = bet;
	this.state = Player.STATES.SMALL_BLIND;
	this.emit('update', info);
	return bet;
};
Player.prototype.doBigBlind = function() {
	var bet = this.table.minBet;
	var info = this._getInfo();
	this.balance -= bet;
	info.bet = bet;
	this.state = Player.STATES.BIG_BLIND;
	this.emit('update', info);
	return bet;
};

Player.prototype.takeCard = function(card) {
	this.cards.push(card);
	this.socket.emit('player:new-card', card);
};

Player.prototype._handleCheck = function() {
	this.emit('check', this);
	this._changeState(Player.STATES.CHECK);
};

Player.prototype._handleCall = function() {
	this._changeState(Player.STATES.BET_DONE);
	this.emit('call', this);
	this.balance -= this.table.minBet;
	var info = this._getInfo();
	info.betType = 'call';
	this.emit('update', info);
};
Player.prototype._handleRaise = function(amount) {
	this._changeState(Player.STATES.BET_DONE);
	this.emit('raise', {
		id: this.id,
		amount: amount
	});
	this.balance -= amount;
	var info = this._getInfo();
	info.betType = 'raise';
	info.bet = amount;
	this.emit('update', info);
};
Player.prototype._handleFold = function() {
	this._changeState(Player.STATES.FOLDED);
	this.emit('fold', {id: this.id});
	var info = this._getInfo();
	this.emit('update', info);
};
Player.prototype._getInfo = function() {
	return {
		id: this.id,
		nickname: this.nickname,
		cash: this.balance,
		state: this.state
	};
};


module.exports = Player;
