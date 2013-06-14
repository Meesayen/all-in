(function(scope) {


var DesktopClient = function(socketUri) {
	this.socket = io.connect(socketUri);
	this.token = null;
};

DesktopClient.prototype = {
	init: function() {
		this.token = document.querySelector('.token');
		this.playersBox = document.querySelector('.players');
		this._initComms();
		this._addCallbacks();
		this.socket.emit('desktop:connection');
	},

	_addCallbacks: function() {
		// this.btn.addEventListener('click', this._onSubmit.bind(this));
		setTimeout(function() {
			this._insertPlayerBalloon({id: 'player1', nickname: 'Player 1'});
		}.bind(this), 3000);
		setTimeout(function() {
			this._insertPlayerBalloon({id: 'player2', nickname: 'Player 2'});
		}.bind(this), 6000);
		setTimeout(function() {
			this._insertPlayerBalloon({id: 'player3', nickname: 'Player 3'});
		}.bind(this), 9000);
		setTimeout(function() {
			this._insertPlayerBalloon({id: 'player4', nickname: 'Player 4'});
		}.bind(this), 9600);
	},

	_initComms: function() {
		this.socket.on('game:tokenized', this._handleGameEstablished.bind(this));
		this.socket.on('game:newplayer', this._handleNewPlayer.bind(this));
		this.socket.on('game:playerleft', this._handlePlayerLeft.bind(this));
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
	},

	_removePlayerBalloon: function(player) {

	},

	_handlePlayerLeft: function(player) {
		var seat = document.querySelector('.players li #' + player.id);
		seat.querySelector('.nickname').innerHTML = '';
		seat.classList.remove('active');
	}
};






var main = function() {
	new DesktopClient(window.location.origin).init();
}

main();


})(window);
