/* globals define */

define([
	'lib/x'
], function(
	x
) {

	return x.Class({
		__name__: 'LobbyController',
		parent: x.DomHandler,
		init: function(socket) {
			this._template = 'desktop.lobby';
			this._model = [];
			this.super();

			this._token = this.nodes.one('.token-box');
			this._next = this.nodes.one('.button.next');
			this._page = this.nodes.one('.page');

			this._states = {
				current: 'landing',
				LANDING: 'landing',
				INFO: 'instructions',
				TOKEN: 'token'
			};

			this._socket = socket;
			this._bindSocketEvents();
		},
		events: {
			'onnext': '_onNextHandler'
		},
		hide: function() {
			this._root.style.display = 'none';
		},
		destroy: function() {
			//TODO deinitComms, remove listeners, remove from DOM
		},
		_bindSocketEvents: function() {
			this._socket.on('game:tokenized', this._handleGameTokenReceived.bind(this));
			this._socket.on('game:ready-to-play', this._handleReadyToPlay.bind(this));
			this._socket.on('game:not-ready-to-play', this._handleNotReadyToPlay.bind(this));
		},
		_onNextHandler: function() {
			var state = this._states.current;
			if (state === this._states.LANDING) {
				this._showInstructions();
			} else if (state === this._states.INFO) {
				this._showToken();
			} else {
				this._next.classList.add('loading');
				this._socket.emit('web:start');
			}
		},
		_showInstructions: function() {
			this._states.current = this._states.INFO;
			this._page.dataset.phase = this._states.INFO;
		},
		_showToken: function() {
			this._states.current = this._states.TOKEN;
			this._page.dataset.phase = this._states.TOKEN;
			this._next.innerText = 'START';
			this._next.classList.add('disabled');
			this._socket.emit('web:connection');
		},
		_handleGameTokenReceived: function(data) {
			this._token.innerText = data.token;
		},
		_handleReadyToPlay: function() {
			this._next.classList.remove('disabled');
		},
		_handleNotReadyToPlay: function() {
			this._next.classList.add('disabled');
		}
	});
});
