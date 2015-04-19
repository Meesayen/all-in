import Player from './player';

export default class Players {
	constructor(socket) {
		this._socket = socket;
		this._players = {};
		this._root = document.createElement('div');
		this._root.classList.add('players');

		this._initComms();
	}
	
	get root() {
		return this._root;
	}

	_initComms() {
		this._socket.on('game:player-joined', this._handlePlayerJoined.bind(this));
		this._socket.on('game:player-left', this._handlePlayerLeft.bind(this));
	}
	_handlePlayerJoined(player) {
		let balloon = new Player(player, this._socket);
		let box = document.createElement('div');

		box.classList.add('player-box');
		box.appendChild(balloon.root);
		this._players[player.id] = balloon;
		this._root.appendChild(box);
	}
	_handlePlayerLeft(player) {
		let balloon = this._players[player.id];
		let box = balloon.root.parentNode;

		balloon.remove();
		this._root.removeChild(box);
		delete this._players[player.id];
	}
}
