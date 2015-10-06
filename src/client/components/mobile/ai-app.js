/* global io */

import { communicator, eventHandler } from 'lib/decorators/socket';

@communicator
class MobileApp {
  beforeRegister() {
    this.is = 'ai-app';
  }

  ready() {
    this.nickname = null;
    this.balance = null;
    this.token = null;
  }

  attached() {
    this.async(() => {
      this.run();
    });
  }

  run() {
    this.socket = io();
    this.lobby = this.querySelector('ai-lobby');
    this.lobby.socket = this.socket;
    this.table = this.querySelector('ai-table');
    this.table.socket = this.socket;
  }

  @eventHandler('game:start')
  _handleGameStart() {
    this.lobby.remove();
    this.table.show();
  }
}

Polymer(MobileApp);
