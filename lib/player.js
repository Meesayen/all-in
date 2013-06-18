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

	this.init(o);
};

util.inherits(Player, EventEmitter);

Player.prototype.init = function(o) {
	this.id = o.id;
	this.nickname = o.nickname;
	this.balance = o.balance;
	this.socket = o.socket;

	this.socket.emit('game:connected', {
		nickname: this.nickname,
		balance: this.balance
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
Player.prototype._handleCall = function(data) {
	// TODO
};
Player.prototype._handleRaise = function(data) {
	// TODO
};
Player.prototype._handleFold = function(data) {
	// TODO
};


module.exports = Player;
