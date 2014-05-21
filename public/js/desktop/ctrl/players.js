/* globals define */

define([
	'lib/x',
	'comp/player'
], function(
	x,
	Player
) {

	return x.Class({
		__name__: 'PlayerController',
		parent: x.DomHandler,
		init: function(socket) {
			this._socket = socket;
			this._players = {};
			this._root = document.createElement('div');
			this._root.classList.add('players');

			this._initComms();
		},
		_initComms: function() {
			this._socket.on('game:player-joined', this._handlePlayerJoined.bind(this));
			this._socket.on('game:player-left', this._handlePlayerLeft.bind(this));
		},
		_handlePlayerJoined: function(player) {
			var balloon = new Player(player, this._socket);

			var box = document.createElement('div');
			box.classList.add('player-box');
			box.appendChild(balloon.root);

			this._players[player.id] = balloon;
			this._root.appendChild(box);
		},
		_handlePlayerLeft: function(player) {
			var balloon = this._players[player.id];
			var parent = balloon.root.parentNode;
			balloon.remove();
			this._root.removeChild(parent);
			delete this._players[player.id];
		}
	});

});
