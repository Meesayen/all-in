/* global io */

import Lobby from '../desktop/lobby';
import Players from '../desktop/players';
import Table from '../desktop/table';

class DesktopClient {
	constructor() {
		this._socket = io();

		this._root = document.body;
		this._lobby = new Lobby(this._socket);
		this._player = new Players(this._socket);
		this._table = new Table(this._socket);

		this._gameArea = this._root.querySelector('.game-area');
		this._gameArea.appendChild(this._lobby.root);
		this._gameArea.appendChild(this._player.root);
		this._gameArea.appendChild(this._table.root);
	}
	run() {
		this._initComms();
	}
	_initComms() {
		this._socket.on('game:start', this._handleGameStart.bind(this));
		this._socket.on('game:draw-flop', this._handleDrawFlop.bind(this));
	}
	_handleGameStart() {
		this._lobby.hide();
		this._lobby.destroy();
		this._gameArea.dataset.state = 'table';
		this._table.show();
	}

	_handleDrawFlop(card) {
		console.log(card);
	}
}

let dc = new DesktopClient();
dc.run();
