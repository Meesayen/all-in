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

		this.lobby = document.querySelector('#lobby');
		this.gameTable = document.querySelector('#game-table');

		this.token = document.querySelector('.token-box');
		this.playersBox = document.querySelector('#lobby .players');
		this.tablePlayersBox = document.querySelector('#game-table .players');
		this.tablePlayerTmpl = document.querySelector('template.player-tmpl');

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

		this.socket.on('player:update', this._handlePlayerUpdate.bind(this));
		this.socket.on('player:call', this._handlePlayerCall.bind(this));
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
	_handleGameStart: function(data) {
		console.log('Game Started');

		for (var i = 0, p; p = data.players[i]; i++) {
			var player = this.tablePlayerTmpl.content.cloneNode(true);
			player.querySelector('.nickname').innerHTML = p.nickname;
			player.querySelector('.balance').innerHTML = p.balance;
			player.querySelector('.player').classList.add(p.id);
			player.querySelector('.player').dataset.status = p.status;
			this.tablePlayersBox.appendChild(player);
		}

		this.lobby.style.display = 'none';
		this.gameTable.style.display = 'block';
	},

	_handleDrawFlop: function(card) {
		console.log(card);
	},

	/* Player Round Actions */

	_handlePlayerUpdate: function(player) {
		console.log('player update', player);
		var p = this.tablePlayersBox.querySelector('#game-table .' + player.id);

		if (!p) return;

		p.dataset.status = player.status;
		p.querySelector('.balance').innerHTML = player.balance;
	},
	_handlePlayerCall: function(player) {
		console.log(player);
	}
};



var main = function() {
	new DesktopClient(window.location.origin).init();
}

main();


})(window);
