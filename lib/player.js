var
	EventEmitter = require("events").EventEmitter,
	util = require("util");


var Player = function(socket) {
	Player.super_.call(this);
	this.id = null;
	this.nickname = null;
	this.balance = 1000;
	this.socket = socket;

	this.init();
};

util.inherits(Player, EventEmitter);

Player.prototype.init = function() {
	this._initComms();
};
Player.prototype._initComms = function() {
	this.socket.on('disconnect', this._handleDisconnect.bind(this));
};
Player.prototype._handleDisconnect = function(socket) {
	this.emit('disconnection', {
		id: this.id
	});
};


module.exports = Player;
