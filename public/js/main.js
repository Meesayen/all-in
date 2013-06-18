(function(scope) {


var DesktopClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.token = null;

	this._balloonFloat = this._balloonFloat.bind(this);
	this._clearBalloon = this._clearBalloon.bind(this);
};

DesktopClient.prototype = {
	init: function() {
		this.btnSubmit = document.querySelector('.button.submit');

		this.token = document.querySelector('.token');
		this.playersBox = document.querySelector('.players');
		this._initComms();
		this._addCallbacks();
		this.socket.emit('desktop:connection');
	},

	_addCallbacks: function() {
		this.btnSubmit.addEventListener('click', this._onSubmit.bind(this));
		// this.btn.addEventListener('click', this._onSubmit.bind(this));
		// setTimeout(function() {
		// 	this._insertPlayerBalloon({id: 'player1', nickname: 'Player 1'});
		// }.bind(this), 3000);
		// setTimeout(function() {
		// 	this._insertPlayerBalloon({id: 'player2', nickname: 'Player 2'});
		// }.bind(this), 6000);
		// setTimeout(function() {
		// 	this._insertPlayerBalloon({id: 'player3', nickname: 'Player 3'});
		// }.bind(this), 9000);
		// setTimeout(function() {
		// 	this._insertPlayerBalloon({id: 'player4', nickname: 'Player 4'});
		// }.bind(this), 9600);
	},

	_onSubmit: function(e) {
		this.btnSubmit.classList.add('loading');
		this.socket.emit('game:start');
	},

	_initComms: function() {
		this.socket.on('game:tokenized', this._handleGameEstablished.bind(this));
		this.socket.on('game:newplayer', this._handleNewPlayer.bind(this));
		this.socket.on('game:playerleft', this._handlePlayerLeft.bind(this));
		this.socket.on('player:info-update', this._handlePlayerInfoUpdate.bind(this));
		this.socket.on('game:ready-to-play', this._handleReadyToPlay.bind(this));
		this.socket.on('game:not-ready-to-play', this._handleNotReadyToPlay.bind(this));
		this.socket.on('game:ack-start', this._handleAckStart.bind(this));
	},

	_handleGameEstablished: function(data) {
		this.token.innerHTML = data.token;
	},

	_handlePlayerInfoUpdate: function(player) {
		var box = document.querySelector('.player[data-player-id="' + player.id + '"]');
		var nickname = box.querySelector('.nickname');
		nickname.innerHTML = player.nickname;
	},

	_handleNewPlayer: function(player) {
		this._insertPlayerBalloon(player);
	},
	_insertPlayerBalloon: function(player) {
		var box = document.createElement('div');
		var nickname = document.createElement('div');
		box.dataset.playerId = player.id;
		nickname.innerHTML = player.nickname;
		nickname.classList.add('nickname');
		box.classList.add('player');
		box.classList.add(player.id);
		box.appendChild(nickname);
		this.playersBox.appendChild(box);
		this._balloonPop(box);
	},
	_balloonPop: function(box) {
		box.classList.add('pop');
		box.addEventListener('animationEnd', this._balloonFloat);
		box.addEventListener('webkitAnimationEnd', this._balloonFloat);
	},
	_balloonFloat: function(e) {
		var box = e.srcElement;
		box.classList.remove('pop');
		box.classList.add('float');
		box.removeEventListener('animationEnd', this._balloonFloat);
		box.removeEventListener('webkitAnimationEnd', this._balloonFloat);
	},
	_handlePlayerLeft: function(player) {
		this._removePlayerBalloon(player.id);
	},
	_removePlayerBalloon: function(id) {
		var box = document.querySelector('.player[data-player-id="' + id + '"]');
		box.addEventListener('animationEnd', this._clearBalloon);
		box.addEventListener('webkitAnimationEnd', this._clearBalloon);
		box.classList.remove('float');
		box.classList.add('puff');
	},
	_clearBalloon: function(e) {
		var box = e.srcElement;
		box.removeEventListener('animationEnd', this._clearBalloon);
		box.removeEventListener('webkitAnimationEnd', this._clearBalloon);
		box.parentNode.removeChild(box);
	},
	_handleReadyToPlay: function(data) {

		console.log('Ready to play');
	},
	_handleNotReadyToPlay: function(data) {
		console.log('Not ready to play');
	},
	_handleAckStart: function(data) {
		console.log('Game Started');
	}
};



var main = function() {
	new DesktopClient(window.location.origin).init();
}

main();


})(window);
