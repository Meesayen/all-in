(function(scope) {


var DesktopClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.token = null;

	this._balloonFloat = this._balloonFloat.bind(this);
	this._clearBalloon = this._clearBalloon.bind(this);
};

DesktopClient.prototype = {
	init: function() {
		this.btnNext = document.querySelector('.button.next');
		this.page = document.querySelector('.page');

		this.token = document.querySelector('.token-box');
		this.playersBox = document.querySelector('.players');
		this._initComms();
		this._addCallbacks();
	},

	_addCallbacks: function() {
		this.btnNext.addEventListener('click', this._onNext.bind(this));
	},

	_onNext: function(e) {
		var phase = this.page.dataset.phase;
		if (phase === 'landing') {
			this._showInstructions();
		} else if (phase === 'instructions') {
			this._showToken();
		} else {
			this.btnNext.classList.add('loading');
			this.socket.emit('web:start');
		}
	},

	_initComms: function() {
		this.socket.on('game:tokenized', this._handleGameEstablished.bind(this));
		this.socket.on('game:player-joined', this._handlePlayerJoined.bind(this));
		this.socket.on('game:player-left', this._handlePlayerLeft.bind(this));
		this.socket.on('player:info-update', this._handlePlayerInfoUpdate.bind(this));
		this.socket.on('game:ready-to-play', this._handleReadyToPlay.bind(this));
		this.socket.on('game:not-ready-to-play', this._handleNotReadyToPlay.bind(this));
		this.socket.on('game:start', this._handleGameStart.bind(this));

		this.socket.on('game:draw-flop', this._handleDrawFlop.bind(this));
	},

	_showInstructions: function() {
		this.page.dataset.phase = 'instructions';
	},
	_showToken: function() {
		this.page.dataset.phase = 'token';
		this.btnNext.innerHTML = 'START';
		this.btnNext.classList.add('disabled');
		this.socket.emit('web:connection');
	},

	_handleGameEstablished: function(data) {
		this.token.innerHTML = data.token;
	},

	_handlePlayerInfoUpdate: function(player) {
		var box = document.querySelector('.player[data-player-id="' + player.id + '"]');
		var nickname = box.querySelector('.nickname');
		nickname.innerHTML = player.nickname !== '' ? player.nickname : '&nbsp;';
	},

	_handlePlayerJoined: function(player) {
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
	_handleReadyToPlay: function() {
		this.btnNext.classList.remove('disabled');
	},
	_handleNotReadyToPlay: function() {
		this.btnNext.classList.add('disabled');
	},
	_handleGameStart: function() {
		console.log('Game Started');
	},

	_handleDrawFlop: function(card) {
		console.log(card);
	}
};



var main = function() {
	new DesktopClient(window.location.origin).init();
}

main();


})(window);
