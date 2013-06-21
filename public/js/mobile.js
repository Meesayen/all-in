(function(scope) {


var MobileClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.nickname = null;
	this.balance = null;
	this.token = null;
};

MobileClient.prototype = {
	init: function() {
		this.page = document.querySelector('.page');
		this.page.style.height = window.screen.height + 'px';
		this.btnNext = document.querySelector('.button.next');

		this.tokenInput = document.querySelector('.token');
		this.nicknameInput = document.querySelector('.player-info[name="nickname"]');

		this.notice = document.querySelector('.notice');
		this._initComms();
		this._addCallbacks();
	},

	_addCallbacks: function() {
		this.btnNext.addEventListener('click', this._onNext.bind(this));
		this.nicknameInput.addEventListener('keyup', this._onUpdate.bind(this));
	},

	_initComms: function() {
		this.socket.on('game:connected', this._handleConnection.bind(this));
		this.socket.on('game:wrongtoken', this._handleWrongToken.bind(this));
		this.socket.on('game:lobbyfull', this._handleFullLobby.bind(this));
		this.socket.on('player:ack-ready', this._handleAckReady.bind(this));
		this.socket.on('game:ack-start', this._handleAckStart.bind(this));
	},

	_onNext: function(e) {
		var phase = this.page.dataset.phase;
		if (phase === 'token-request') {
			this._sendToken();
		} else if (phase === 'info-update') {
			this._sendReady();
		} else {
			this.socket.emit('player:ready');
		}
	},

	_sendToken: function() {
		this.btnNext.classList.add('loading');
		this.token = this.tokenInput.value.toUpperCase();
		this.socket.emit('device:connection', { token:  this.token });
	},

	_sendReady: function() {
		this.socket.emit('player:ready');
	},

	_onUpdate: function(e) {
		// TODO gravatar
		var nickname = this.nicknameInput.value;
		this.socket.emit('player:info-update', { nickname:  nickname });
	},
	_onReady: function(e) {
		// TODO update & ready buttons disappear, and a loading is put in place
		this.socket.emit('player:ready');
	},

	_handleConnection: function(player) {
		this.nickname = player.nickname;
		this.balance = player.balance;
		this.nicknameInput.value = this.nickname;
		this.page.dataset.playerId = player.id;
		this.btnNext.classList.remove('loading');

		this.page.dataset.phase = 'info-update';
		this.btnNext.innerHTML = 'READY';
	},

	_handleWrongToken: function(data) {
		this.tokenInput.value = '';
		this.showNotice(data.message);
	},

	_handleFullLobby: function(data) {
		this.showNotice(data.message);
	},

	_handleAckReady: function(data) {
		this.page.dataset.phase = 'waiting';
	},

	_handleAckStart: function(data) {
		console.log('Game Started');
	},

	showNotice: function(message) {
		this.notice.innerHTML = message;
		this.notice.classList.add('show');
		setTimeout(function() {
			this.notice.classList.remove('show');
			this.btnSubmit.classList.remove('loading');
		}.bind(this), 4000);
	}
};



var main = function() {
	new MobileClient(window.location.origin).init();
}

main();


})(window);
