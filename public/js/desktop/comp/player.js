/* globals define */

define([
	'lib/x'
], function(
	x
) {

	var Player = x.Class({
		__name__: 'Player',
		parent: x.DomHandler,
		init: function(player, socket) {
			this._socket = socket;
			this._state = Player.IDLE_STATE;
			this.player = player;
			this._template = 'desktop.player.slot';

			this.player.status = 'not ready';

			this._model = {
				player: this.player
			};
			this.super();

			this.__slotFloat = this._slotFloat.bind(this);
			this.__removeFromDom = this._removeFromDom.bind(this);

			this._root.addEventListener('animationEnd', this.__slotFloat);
			this._root.addEventListener('webkitAnimationEnd', this.__slotFloat);

			this._initComms();
		},
		accessors: {
			state: {
				get: function() {
					return this._state;
				},
				set: function(state) {
					if (this._state !== state) {
						this._state = state;
						this._updateState();
					}
				}
			}
		},
		statics: {
			IDLE_STATE: 0,
			READY_STATE: 1,
			WAITING_STATE: 2,
			THINKING_STATE: 3,
			SMALL_BLIND_STATE: 5,
			BIG_BLIND_STATE: 6,
			FOLD_STATE: 7,
			RAISE_STATE: 9,
			CALL_STATE: 10,
			BROKE_STATE: 11,
			CHECK_STATE: 12
		},
		remove: function() {
			this._root.addEventListener('animationEnd', this.__removeFromDom);
			this._root.addEventListener('webkitAnimationEnd', this.__removeFromDom);
			this._root.classList.remove('float');
			this._root.classList.add('puff');
		},
		_initComms: function() {
			this._socket.on('game:start', this._onGameStart.bind(this));
			this._socket.on('player:info-update', this._filter.bind(this, this._onInfoUpdate));
			this._socket.on('player:ready', this._filter.bind(this, this._onReady));

			// Game actions
			this._socket.on('player:check', this._filter.bind(this, this._onCheck));
			this._socket.on('player:call', this._filter.bind(this, this._onCall));
			this._socket.on('player:raise', this._filter.bind(this, this._onRaise));
			this._socket.on('player:fold', this._filter.bind(this, this._onFold));
			this._socket.on('player:thinking', this._filter.bind(this, this._onThinking));
			this._socket.on('player:waiting', this._filter.bind(this, this._onWaiting));
		},
		_slotFloat: function() {
			this._root.classList.remove('pop');
			this._root.classList.add('float');
			this._root.removeEventListener('animationEnd', this.__slotFloat);
			this._root.removeEventListener('webkitAnimationEnd', this.__slotFloat);
		},
		_removeFromDom: function() {
			this._root.removeEventListener('animationEnd', this.__removeFromDom);
			this._root.removeEventListener('webkitAnimationEnd', this.__removeFromDom);
			this._root.parentNode.removeChild(this._root);
		},
		_filter: function(fn, player) {
			if (this.player.id === player.id) {
				fn.call(this, player);
			}
		},
		_onInfoUpdate: function(player) {
			switch (player.state) {
			case Player.WAITING_STATE:
				player.status = 'waiting';
				break;
			case Player.THINKING_STATE:
				player.status = 'thinking';
				break;
			case Player.READY_STATE:
				player.status = 'ready!';
				break;
			case Player.FOLD_STATE:
				player.status = 'fold';
				break;
			case Player.BROKE_STATE:
				break;
			default:
				player.status = this.player.status;
				break;
			}
			this.model = { player: player };
		},
		_onReady: function(player) {
			this.state = Player.READY_STATE;
		},
		_onGameStart: function() {
			this._root.classList.remove('float');
		},

		_onCheck: function(player) {
			this.state = Player.CHECK_STATE;
		},
		_onCall: function(player) {
			console.log('onCall');
			this.state = Player.CALL_STATE;
		},
		_onRaise: function(player) {
			this.state = Player.RAISE_STATE;
		},
		_onFold: function(player) {
			this.state = Player.FOLD_STATE;
		},
		_onWaiting: function(player) {
			this.state = Player.WAITING_STATE;
		},
		_onThinking: function(player) {
			this.state = Player.THINKING_STATE;
		},

		_updateState: function() {
			this._root.classList.remove('fold');
			this._root.classList.remove('thinking');
			this._root.classList.remove('broke');
			switch (this._state) {
			case Player.WAITING_STATE:
				this.player.status = 'waiting';
				break;
			case Player.THINKING_STATE:
				this._root.classList.add('thinking');
				this.player.status = 'thinking';
				break;
			case Player.CHECK_STATE:
				this.player.status = 'check';
				break;
			case Player.CALL_STATE:
				this.player.status = 'call';
				break;
			case Player.RAISE_STATE:
				this.player.status = 'raise!';
				break;
			case Player.FOLD_STATE:
				this._root.classList.add('fold');
				this.player.status = 'fold';
				break;
			case Player.IDLE_STATE:
				this.player.status = 'not ready';
				break;
			case Player.READY_STATE:
				this.player.status = 'ready!';
				break;
			case Player.BROKE_STATE:
				this._root.classList.add('broke');
				this.player.status = 'broke!';
				break;
			}
			this.model = {player: this.player};
		}
	});

	return Player;
});
