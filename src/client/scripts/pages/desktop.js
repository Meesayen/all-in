/* global io */

// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import Lobby from '../desktop/lobby';
import Players from '../desktop/players';
import Table from '../desktop/table';
import * as socket from '../core/decorators/socket'; // jshint ignore:line

// >>>
@socket.communicator
// <<<
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
    this.initializeSocketComm(this._socket);
  }

  // >>>
  @socket.eventHandler('game:start')
  // <<<
  _handleGameStart() {
    this._lobby.hide();
    this._lobby.destroy();
    this._gameArea.dataset.state = 'table';
    this._table.show();
  }

  // >>>
  @socket.eventHandler('game:draw-flop')
  // <<<
  _handleDrawFlop(card) {
    console.log(card);
  }
}

let dc = new DesktopClient();
dc.run();
