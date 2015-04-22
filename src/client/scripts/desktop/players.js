// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import * as socket from '../core/decorators/socket'; // jshint ignore:line

// >>>
@socket.communicator
// <<<
export default class Players {
  constructor(socket) {
    this.socket = socket;
    this._players = {};
    this._root = document.createElement('div');
    this._root.classList.add('players');
  }

  get root() {
    return this._root;
  }

  // >>>
  @socket.eventHandler('game:player-joined')
  // <<<
  _handlePlayerJoined(player) {
    let balloon = document.createElement('ai-player');
    balloon.player = player;
    balloon.socket = this._socket;
    this._players[player.id] = balloon;
    this._root.appendChild(balloon);
  }

  // >>>
  @socket.eventHandler('game:player-left')
  // <<<
  _handlePlayerLeft(player) {
    let balloon = this._players[player.id];
    balloon.destroy();
    delete this._players[player.id];
  }
}
