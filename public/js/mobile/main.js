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

		this.lobby = document.querySelector('#lobby');
		this.gameTable = document.querySelector('#game-table');

		this.tokenInput = document.querySelector('.token');
		this.nicknameInput = document.querySelector('.player-info[name="nickname"]');

		this.cards = [].slice.apply(document.querySelectorAll('.card'));
		this.callBtn = document.querySelector('.call');
		this.raiseBtn = document.querySelector('.raise');
		this.foldBtn = document.querySelector('.fold');


		this.notice = document.querySelector('.notice');
		this._initComms();
		this._addCallbacks();
	},

	_addCallbacks: function() {
		this.btnNext.addEventListener('click', this._onNext.bind(this));
		this.nicknameInput.addEventListener('keyup', this._onUpdate.bind(this));
		this.callBtn.addEventListener('click', this._onCall.bind(this));
		this.raiseBtn.addEventListener('click', this._onRaise.bind(this));
		this.foldBtn.addEventListener('click', this._onFold.bind(this));
	},

	_initComms: function() {
		this.socket.on('game:connected', this._handleConnection.bind(this));
		this.socket.on('game:wrongtoken', this._handleWrongToken.bind(this));
		this.socket.on('game:lobbyfull', this._handleFullLobby.bind(this));
		this.socket.on('player:ack-ready', this._handleAckReady.bind(this));
		this.socket.on('game:start', this._handleGameStart.bind(this));

		this.socket.on('player:new-card', this._handleNewCard.bind(this));
		this.socket.on('player:wait-to-bet', this._handleWaitToBet.bind(this));
		this.socket.on('player:ack-bet', this._handleWaitToBet.bind(this));
		this.socket.on('player:my-turn', this._handleMyTurn.bind(this));
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

	_onCall: function(e) {
		this.socket.emit('player:call');
	},
	_onRaise: function(e) {
		this.socket.emit('player:raise', {
			amount: 100
		});
	},
	_onFold: function(e) {
		this.socket.emit('player:fold');
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

	_handleGameStart: function(data) {
		console.log('Game Started');
		this.lobby.style.display = 'none';
		this.gameTable.style.display = 'block';
	},
	_handleNewCard: function(card) {
		console.log(card);
		var cardEl = this.cards.shift();
		cardEl.dataset.seed = card.seed;
		cardEl.querySelector('.value').innerHTML = card.value;
	},
	_handleWaitToBet: function() {
		this.callBtn.classList.add('disabled')
		this.raiseBtn.classList.add('disabled')
		this.foldBtn.classList.add('disabled')
	},
	_handleMyTurn: function() {
		this.callBtn.classList.remove('disabled')
		this.raiseBtn.classList.remove('disabled')
		this.foldBtn.classList.remove('disabled')
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
