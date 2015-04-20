// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import Player from './player';
import * as socket from '../core/decorators/socket'; // jshint ignore:line

// >>>
@socket.communicator
// <<<
export default class Players {
  constructor(socket) {
    this._socket = socket;
    this._players = {};
    this._root = document.createElement('div');
    this._root.classList.add('players');

    this.initializeSocketComm(socket);
  }

  get root() {
    return this._root;
  }

  // >>>
  @socket.eventHandler('game:player-joined')
  // <<<
  _handlePlayerJoined(player) {
    let balloon = new Player(player, this._socket);
    let box = document.createElement('div');

    box.classList.add('player-box');
    box.appendChild(balloon.root);
    this._players[player.id] = balloon;
    this._root.appendChild(box);
  }

  // >>>
  @socket.eventHandler('game:player-left')
  // <<<
  _handlePlayerLeft(player) {
    let balloon = this._players[player.id];
    let box = balloon.root.parentNode;

    balloon.remove();
    this._root.removeChild(box);
    delete this._players[player.id];
  }
}
