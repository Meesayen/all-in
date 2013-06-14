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
	},

	_onSubmit: function(e) {
		this.token = this.tokenInput.value.toUpperCase();
		this.socket.emit('device:connection', { token:  this.token });
	},

	_handleWrongToken: function(data) {
		this.tokenInput.value = '';
		this.notice.classList.add('show');
		setTimeout(function() {
			this.notice.classList.remove('show');
		}.bind(this), 4000);
	}
};






var main = function() {
	new MobileClient(window.location.origin).init();
}

main();


})(window);
