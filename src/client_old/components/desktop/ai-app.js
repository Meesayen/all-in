/* global io */

import { communicator, eventHandler } from 'lib/decorators/socket';

@communicator
class DesktopApp {
  beforeRegister() {
    this.is = 'ai-app';
  }

  attached() {
    this.async(() => {
      this.run();
    });
  }

  run() {
    this.socket = io();

    this._lobby = this.querySelector('ai-lobby');
    this._lobby.socket = this._socket;
    this._roster = this.querySelector('ai-roster');
    this._roster.socket = this._socket;
    this._table = this.querySelector('ai-table');
    this._table.socket = this._socket;
  }

  @eventHandler('game:start')
  _handleGameStart() {
    this._lobby.remove();
    this.querySelector('.game-area').dataset.state = 'table';
    this._table.show();
  }
}

Polymer(DesktopApp);
