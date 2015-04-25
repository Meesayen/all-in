// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import * as socket from '../core/decorators/socket'; // jshint ignore:line

// >>>
@socket.communicator
// <<<
class MobileClient {
  constructor() {
    this.nickname = null;
    this.balance = null;
    this.token = null;
  }
  init() {
    let doc = document;
    this.socket = io();

    this.appEl = doc.querySelector('.app');
    this.lobby = document.createElement('ai-mobile-lobby');
    this.lobby.socket = this.socket;
    this.table = document.createElement('ai-mobile-table');
    this.table.socket = this.socket;

    this.appEl.appendChild(this.lobby);
    this.appEl.appendChild(this.table);
  }

  // >>>
  @socket.eventHandler('game:start')
  // <<<
  _handleGameStart() {
    this.lobby.remove();
    this.table.show();
  }
}

let mc = new MobileClient();
mc.init();
