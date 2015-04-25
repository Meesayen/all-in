// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import * as socket from '../../js/core/decorators/socket'; // jshint ignore:line

const STATES = {
  LANDING: 'landing',
  PLAYER_INFO: 'player-info',
  PLAYER_READY: 'player-ready'
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
    this.nickname = '';
    this.state = STATES.LANDING;

    this._onNextClick = this._onNextHandler.bind(this);
    this.$.next.addEventListener('click', this._onNextClick);
  }

  detached() {
    console.log('detached');
    // TODO kill communications
  }

  _onNextHandler() {
    let state = this.state;
    if (state === STATES.LANDING) {
      this._sendToken();
    } else if (state === STATES.PLAYER_INFO) {
      this._sendReady();
    }
  }

  _onInputKeypress(e) {
    if (e.keyIdentifier === 'Enter') {
      this._onNextHandler();
    }
  }

  _sendToken() {
    this.$.next.classList.add('loading');
    this.socket.emit('device:connection', {
      token: this.token.toUpperCase()
    });
  }

  _sendReady() {
    this.socket.emit('player:ready');
  }

  _onUpdate() {
    // TODO gravatar
    this.socket.emit('player:info-update', {
      nickname: this.nickname
    });
  }

  showNotice(message) {
    this.notice = message;
    this.$.notice.classList.add('show');
    setTimeout(() => {
      this.$.notice.classList.remove('show');
      this.$.next.classList.remove('loading');
    }, 4000);
  }

  // >>>
  @socket.eventHandler('game:connected')
  // <<<
  _handleConnection(player) {
    this.nickname = player.nickname;
    this.balance = player.balance;
    this.playerId = player.id;
    this.$.next.classList.remove('loading');

    this.state = STATES.PLAYER_INFO;
    this.$.next.textContent = 'READY';
  }

  // >>>
  @socket.eventHandler('game:wrongtoken')
  // <<<
  _handleWrongToken(data) {
    this.token = '';
    this.showNotice(data.message);
  }

  // >>>
  @socket.eventHandler('game:lobbyfull')
  // <<<
  _handleFullLobby(data) {
    this.showNotice(data.message);
  }

  // >>>
  @socket.eventHandler('player:ack-ready')
  // <<<
  _handleAckReady() {
    this.state = STATES.PLAYER_READY;
  }
}

// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Lobby.prototype.is = 'ai-mobile-lobby';
Lobby.prototype.properties = {
  state: {
    type: String,
    reflectToAttribute: true
  },
  playerId: {
    type: String,
    reflectToAttribute: true
  }
};

document.registerElement('ai-mobile-lobby', Polymer.Class(Lobby.prototype));
