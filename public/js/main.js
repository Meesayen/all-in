(function(scope) {


var DesktopClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.token = null;
};

DesktopClient.prototype = {
	init: function() {
		this.token = document.querySelector('.token');
		this.playerSeats = document.querySelectorAll('.players li');
		this._initComms();
		this._addCallbacks();
		this.socket.emit('desktop:connection');
	},

	_addCallbacks: function() {
		// this.btn.addEventListener('click', this._onSubmit.bind(this));
	},

	_initComms: function() {
		this.socket.on('game:tokenized', this._handleGameEstablished.bind(this));
		this.socket.on('game:newplayer', this._handleNewPlayer.bind(this));
	},

	_handleGameEstablished: function(data) {
		this.token.innerHTML = data.token;
	},
	_handleNewPlayer: function(data) {
		for (var i = 0, p; p = data.players[i]; i++) {
			var seat = this.playerSeats[i];
			seat.querySelector('.nickname').innerHTML = p;
			seat.classList.add('active');
		}
	}
};






var main = function() {
	new DesktopClient(window.location.origin).init();
}

main();


})(window);
