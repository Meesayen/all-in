/* global io */

// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import Players from '../desktop/players';
import * as socket from '../core/decorators/socket'; // jshint ignore:line

// >>>
@socket.communicator
// <<<
class DesktopClient {
  constructor() {
    this._root = document.body;
  }
  run() {
    this.socket = io();

    this._lobby = document.createElement('ai-lobby');
    this._lobby.socket = this._socket;
    this._player = new Players(this._socket);
    this._table = document.createElement('ai-table');
    this._table.socket = this._socket;

    this._gameArea = this._root.querySelector('.game-area');
    this._gameArea.appendChild(this._lobby);
    this._gameArea.appendChild(this._player.root);
    this._gameArea.appendChild(this._table);
  }

  // >>>
  @socket.eventHandler('game:start')
  // <<<
  _handleGameStart() {
    this._lobby.remove();
    this._gameArea.dataset.state = 'table';
    this._table.show();
  }
}

let dc = new DesktopClient();
dc.run();
