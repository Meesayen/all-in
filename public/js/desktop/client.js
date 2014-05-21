/* global define */
/* global io */

define([
	'lib/x',
	'ctrl/lobby',
	'ctrl/players',
	'ctrl/table'
], function(
	x,
	LobbyCtrl,
	PlayerCtrl,
	TableCtrl
) {

	return x.Class({
		__name__: 'DesktopClient',
		parent: x.DomHandler,
		init: function(socketUri) {
			this._socket = io.connect(socketUri);

			this._root = document.body;
			this._lobbyCtrl = new LobbyCtrl(this._socket);
			this._playerCtrl = new PlayerCtrl(this._socket);
			this._tableCtrl = new TableCtrl(this._socket);

			this._gameArea = this.nodes.one('.game-area');
			this._gameArea.appendChild(this._lobbyCtrl.root);
			this._gameArea.appendChild(this._playerCtrl.root);
			this._gameArea.appendChild(this._tableCtrl.root);
		},

		run: function() {
			this._initComms();
			this._addCallbacks();
		},

		_addCallbacks: function() {
		},

		_initComms: function() {
			this._socket.on('game:start', this._handleGameStart.bind(this));

			this._socket.on('game:draw-flop', this._handleDrawFlop.bind(this));
		},

		_handleGameStart: function() {
			this._lobbyCtrl.hide();
			this._lobbyCtrl.destroy();
			this._gameArea.dataset.state = 'table';
			this._tableCtrl.show();
		},

		_handleDrawFlop: function(card) {
			console.log(card);
		}
	});
});
