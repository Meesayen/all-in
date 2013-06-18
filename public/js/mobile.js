(function(scope) {


var MobileClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.nickname = null;
	this.balance = null;
	this.token = null;
};

MobileClient.prototype = {
	init: function() {
		this.btnSubmit = document.querySelector('.button.submit');
		this.btnUpdate = document.querySelector('.button.update');
		this.btnReady = document.querySelector('.button.ready');

		this.pageToken = document.querySelector('#token-page');
		this.pageWaiting = document.querySelector('#waiting-page');

		this.tokenInput = document.querySelector('.token');
		this.notice = document.querySelector('.notice');
		this._initComms();
		this._addCallbacks();
	},

	_addCallbacks: function() {
		this.btnSubmit.addEventListener('click', this._onSubmit.bind(this));
		this.btnUpdate.addEventListener('click', this._onUpdate.bind(this));
		this.btnReady.addEventListener('click', this._onReady.bind(this));
	},

	_initComms: function() {
		this.socket.on('game:connected', this._handleConnection.bind(this));
		this.socket.on('game:wrongtoken', this._handleWrongToken.bind(this));
		this.socket.on('game:lobbyfull', this._handleFullLobby.bind(this));
	},

	_onSubmit: function(e) {
		this.btnSubmit.classList.add('loading');
		this.token = this.tokenInput.value.toUpperCase();
		this.socket.emit('device:connection', { token:  this.token });
	},
	_onUpdate: function(e) {
		// TODO gravatar
		var nickname = document.querySelector('.player-info[name="nickname"]');
		this.socket.emit('player:info-update', { nickname:  nickname.value });
	},
	_onReady: function(e) {
		// TODO update & ready buttons disappear, and a loading is put in place
		this.socket.emit('player:ready');
	},

	_handleConnection: function(data) {
		this.nickname = data.nickname;
		this.balance = data.balance;
		var nickname = document.querySelector('.player-info[name="nickname"]');
		nickname.value = this.nickname;
		this.pageToken.classList.add('exit');
		this.pageWaiting.classList.add('enter');
	},

	_handleWrongToken: function(data) {
		this.tokenInput.value = '';
		this.showNotice(data.message);
	},

	_handleFullLobby: function(data) {
		this.showNotice(data.message);
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
