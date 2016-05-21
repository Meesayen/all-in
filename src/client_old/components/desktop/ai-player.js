import { communicator, eventFilter, eventHandler } from 'lib/decorators/socket';

const PLAYER_STATES = {
  IDLE: 0,
  READY: 1,
  WAITING: 2,
  THINKING: 3,
  SMALL_BLIND: 5,
  BIG_BLIND: 6,
  FOLD: 7,
  RAISE: 9,
  CALL: 10,
  BROKE: 11,
  CHECK: 12
};

@communicator
class Player {
  beforeRegister() {
    this.is = 'ai-player';
  }

  ready() {
    this.player = {};

    this.__slotFloat = this._slotFloat.bind(this);
    this.__removeFromDom = this._removeFromDom.bind(this);

    this.$.balloon.addEventListener('animationEnd', this.__slotFloat);
    this.$.balloon.addEventListener('webkitAnimationEnd', this.__slotFloat);
  }

  attached() {
    this.state = PLAYER_STATES.IDLE;
  }

  get state() {
    return this._state;
  }
  set state(state) {
    if (this._state !== state) {
      this._state = state;
      this._updateState();
    }
  }

  get id() {
    return this.player.id;
  }

  destroy() {
    this.$.balloon.addEventListener('animationEnd', this.__removeFromDom);
    this.$.balloon.addEventListener('webkitAnimationEnd', this.__removeFromDom);
    this.$.balloon.classList.remove('float');
    this.$.balloon.classList.add('puff');
  }
  _slotFloat() {
    this.$.balloon.classList.remove('pop');
    this.$.balloon.classList.add('float');
    this.$.balloon.removeEventListener('animationEnd', this.__slotFloat);
    this.$.balloon.removeEventListener('webkitAnimationEnd', this.__slotFloat);
  }
  _removeFromDom() {
    this.$.balloon.removeEventListener('animationEnd', this.__removeFromDom);
    this.$.balloon.removeEventListener('webkitAnimationEnd', this.__removeFromDom);
    this.remove();
  }

  @eventHandler('game:start')
  _onGameStart() {
    this.$.balloon.classList.remove('float');
  }

  @eventHandler('player:info-update')
  @eventFilter('id')
  _onInfoUpdate(player) {
    switch (player.state) {
    case PLAYER_STATES.WAITING:
      player.status = 'waiting';
      break;
    case PLAYER_STATES.THINKING:
      player.status = 'thinking';
      break;
    case PLAYER_STATES.READY:
      player.status = 'ready!';
      break;
    case PLAYER_STATES.FOLD:
      player.status = 'fold';
      break;
    case PLAYER_STATES.BROKE:
      break;
    default:
      player.status = this.player.status;
      break;
    }
    this.player = player;
  }

  @eventHandler('player:ready')
  @eventFilter('id')
  _onReady() {
    this.state = PLAYER_STATES.READY;
  }

  @eventHandler('player:check')
  @eventFilter('id')
  _onCheck() {
    this.state = PLAYER_STATES.CHECK;
  }

  @eventHandler('player:call')
  @eventFilter('id')
  _onCall() {
    console.log('onCall');
    this.state = PLAYER_STATES.CALL;
  }

  @eventHandler('player:raise')
  @eventFilter('id')
  _onRaise() {
    this.state = PLAYER_STATES.RAISE;
  }

  @eventHandler('player:fold')
  @eventFilter('id')
  _onFold() {
    this.state = PLAYER_STATES.FOLD;
  }

  @eventHandler('player:waiting')
  @eventFilter('id')
  _onWaiting() {
    this.state = PLAYER_STATES.WAITING;
  }

  @eventHandler('player:thinking')
  @eventFilter('id')
  _onThinking() {
    this.state = PLAYER_STATES.THINKING;
  }

  _updateState() {
    let player = this.player;
    this.$.balloon.classList.remove('fold');
    this.$.balloon.classList.remove('thinking');
    this.$.balloon.classList.remove('broke');

    switch (this._state) {
    case PLAYER_STATES.WAITING:
      player.status = 'waiting';
      break;
    case PLAYER_STATES.THINKING:
      this.$.balloon.classList.add('thinking');
      player.status = 'thinking';
      break;
    case PLAYER_STATES.CHECK:
      player.status = 'check';
      break;
    case PLAYER_STATES.CALL:
      player.status = 'call';
      break;
    case PLAYER_STATES.RAISE:
      player.status = 'raise!';
      break;
    case PLAYER_STATES.FOLD:
      this.$.balloon.classList.add('fold');
      player.status = 'fold';
      break;
    case PLAYER_STATES.IDLE:
      player.status = 'not ready';
      break;
    case PLAYER_STATES.READY:
      player.status = 'ready!';
      break;
    case PLAYER_STATES.BROKE:
      this.$.balloon.classList.add('broke');
      player.status = 'broke!';
      break;
    default:
      player.status = 'waiting';
    }
    this.player = {};
    this.player = player;
  }
}

Polymer(Player);
