(function(scope) {


var MobileClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.token = null;
};

MobileClient.prototype = {
	init: function() {
		this.btn = document.querySelector('.button');
		this.tokenInput = document.querySelector('.token');
		this.notice = document.querySelector('.notice');
		this._initComms();
		this._addCallbacks();
	},

	_addCallbacks: function() {
		this.btn.addEventListener('click', this._onSubmit.bind(this));
	},

	_initComms: function() {
		this.socket.on('game:wrongtoken', this._handleWrongToken.bind(this));
		this.socket.on('game:lobbyfull', this._handleFullLobby.bind(this));
	},

	_onSubmit: function(e) {
		this.btn.classList.add('loading');
		this.token = this.tokenInput.value.toUpperCase();
		this.socket.emit('device:connection', { token:  this.token });
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
			this.btn.classList.remove('loading');
		}.bind(this), 4000);
	}
};






var main = function() {
	new MobileClient(window.location.origin).init();
}

main();


})(window);
