// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import * as socket from '../../js/core/decorators/socket'; // jshint ignore:line

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

// >>>
@socket.communicator
// <<<
class Player {
  constructor() {
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

  // >>>
  @socket.eventHandler('game:start')
  // <<<
  _onGameStart() {
    this.$.balloon.classList.remove('float');
  }

  // >>>
  @socket.eventHandler('player:info-update')
  @socket.eventFilter('id')
  // <<<
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

  // >>>
  @socket.eventHandler('player:ready')
  @socket.eventFilter('id')
  // <<<
  _onReady() {
    this.state = PLAYER_STATES.READY;
  }

  // >>>
  @socket.eventHandler('player:check')
  @socket.eventFilter('id')
  // <<<
  _onCheck() {
    this.state = PLAYER_STATES.CHECK;
  }

  // >>>
  @socket.eventHandler('player:call')
  @socket.eventFilter('id')
  // <<<
  _onCall() {
    console.log('onCall');
    this.state = PLAYER_STATES.CALL;
  }

  // >>>
  @socket.eventHandler('player:raise')
  @socket.eventFilter('id')
  // <<<
  _onRaise() {
    this.state = PLAYER_STATES.RAISE;
  }

  // >>>
  @socket.eventHandler('player:fold')
  @socket.eventFilter('id')
  // <<<
  _onFold() {
    this.state = PLAYER_STATES.FOLD;
  }

  // >>>
  @socket.eventHandler('player:waiting')
  @socket.eventFilter('id')
  // <<<
  _onWaiting() {
    this.state = PLAYER_STATES.WAITING;
  }

  // >>>
  @socket.eventHandler('player:thinking')
  @socket.eventFilter('id')
  // <<<
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
    }
    this.player = {};
    this.player = player;
  }
}

// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Player.prototype.is = 'ai-player';

document.registerElement('ai-player', Polymer.Class(Player.prototype));
