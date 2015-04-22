/* global Polymer */

// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import * as socket from '../../js/core/decorators/socket'; // jshint ignore:line

const STATES = {
  LANDING: 'landing',
  INFO: 'instructions',
  TOKEN: 'token'
};

// >>>
@socket.communicator
// <<<
class Lobby {
  constructor() {
  }

  created() {
  }

  ready() {
    this.token = '';
    this.state = STATES.LANDING;

    this._onNextClick = this._onNextHandler.bind(this);
    this.querySelector('.button.next')
        .addEventListener('click', this._onNextClick);
  }

  detached() {
    console.log('detached');
    // TODO kill communications
  }

  _onNextHandler() {
    let state = this.state;
    if (state === STATES.LANDING) {
      this._showInstructions();
    } else if (state === STATES.INFO) {
      this._showToken();
    } else {
      this.$.nextBtn.classList.add('loading');
      this._socket.emit('web:start');
    }
  }
  _showInstructions() {
    this.state = STATES.INFO;
  }
  _showToken() {
    this.state = STATES.TOKEN;
    this.$.nextBtn.textContent = 'START';
    this.$.nextBtn.classList.add('disabled');
    this._socket.emit('web:connection');
  }

  // >>>
  @socket.eventHandler('game:tokenized')
  // <<<
  _handleGameTokenReceived(data) {
    this.token = data.token;
  }

  // >>>
  @socket.eventHandler('game:ready-to-play')
  // <<<
  _handleReadyToPlay() {
    this.$.nextBtn.classList.remove('disabled');
  }

  // >>>
  @socket.eventHandler('game:not-ready-to-play')
  // <<<
  _handleNotReadyToPlay() {
    this.$.nextBtn.classList.add('disabled');
  }

}

// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Lobby.prototype.is = 'ai-lobby';
Lobby.prototype.properties = {
  state: {
    type: String,
    reflectToAttribute: true
  }
};

document.registerElement('ai-lobby', Polymer.Class(Lobby.prototype));
