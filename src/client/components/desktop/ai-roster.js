// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import {communicator, eventHandler} from 'lib/decorators/socket'; // jshint ignore:line

// >>>
@communicator
// <<<
class Roster {
  beforeRegister() {
    this.is = 'ai-roster';
  }

  factoryImpl(socket) {
    this.socket = socket;
  }

  created() {
    this._players = new Map();
  }

  // >>>
  @eventHandler('game:player-joined')
  // <<<
  _handlePlayerJoined(player) {
    let balloon = document.createElement('ai-player');
    balloon.player = player;
    balloon.socket = this.socket;
    this._players.set(player.id, balloon);
    this.$.roster.appendChild(balloon);
  }

  // >>>
  @eventHandler('game:player-left')
  // <<<
  _handlePlayerLeft(player) {
    let balloon = this._players.get(player.id);
    balloon.destroy();
    this._players.remove(player.id);
  }
}

/* jshint -W064 */
Polymer(Roster);
