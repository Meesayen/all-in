import { communicator, eventHandler } from 'lib/decorators/socket';

const MOBILE_STATES = {
  LANDING: 'landing',
  PLAYER_INFO: 'player-info',
  PLAYER_READY: 'player-ready'
};

@communicator
class MobileLobby {
  beforeRegister() {
    this.is = 'ai-lobby';
    this.properties = {
      state: {
        type: String,
        reflectToAttribute: true
      },
      playerId: {
        type: String,
        reflectToAttribute: true
      }
    };
  }

  created() {
  }

  ready() {
    this.token = '';
    this.nickname = '';
    this.state = MOBILE_STATES.LANDING;

    this._onNextClick = this._onNextHandler.bind(this);
    this.$.next.addEventListener('click', this._onNextClick);
  }

  detached() {
    console.log('detached');
    // TODO kill communications
  }

  _onNextHandler() {
    let state = this.state;
    if (state === MOBILE_STATES.LANDING) {
      this._sendToken();
    } else if (state === MOBILE_STATES.PLAYER_INFO) {
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

  @eventHandler('game:connected')
  _handleConnection(player) {
    this.nickname = player.nickname;
    this.balance = player.balance;
    this.playerId = player.id;
    this.$.next.classList.remove('loading');

    this.state = MOBILE_STATES.PLAYER_INFO;
    this.$.next.textContent = 'READY';
  }

  @eventHandler('game:wrongtoken')
  _handleWrongToken(data) {
    this.token = '';
    this.showNotice(data.message);
  }

  @eventHandler('game:lobbyfull')
  _handleFullLobby(data) {
    this.showNotice(data.message);
  }

  @eventHandler('player:ack-ready')
  _handleAckReady() {
    this.state = MOBILE_STATES.PLAYER_READY;
  }
}

Polymer(MobileLobby);
