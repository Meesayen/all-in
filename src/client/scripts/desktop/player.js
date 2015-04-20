// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import { renderSync, renderContentSync } from '../core/tpl';
import * as socket from '../core/decorators/socket'; // jshint ignore:line

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
export default class Player {
  constructor(player, socket) {
    this._socket = socket;
    this._state = PLAYER_STATES.IDLE;
    this.player = player;
    this._template = 'playerSlot';

    this.player.status = 'not ready';

    this._model = {
      player: this.player
    };

    this._root = renderSync(this._template, this._model);

    this.__slotFloat = this._slotFloat.bind(this);
    this.__removeFromDom = this._removeFromDom.bind(this);

    this._root.addEventListener('animationEnd', this.__slotFloat);
    this._root.addEventListener('webkitAnimationEnd', this.__slotFloat);

    // this comes from the @socketController class decoration
    // is this the best way? feels more like a mixin kind of stuff
    this.initializeSocketComm(socket);
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

  get root() {
    return this._root;
  }

  get model() {
    return this._model;
  }
  set model(model) {
    this._model = model;
    this._refresh();
  }

  get id() {
    return this.player.id;
  }

  _refresh() {
    let firstchild;
    let children = renderContentSync(this._template, this._model);
    while ((firstchild = this._root.firstChild)) {
      this._root.removeChild(firstchild);
    }
    while ((firstchild = children.firstChild)) {
      this._root.appendChild(firstchild);
    }
  }

  remove() {
    this._root.addEventListener('animationEnd', this.__removeFromDom);
    this._root.addEventListener('webkitAnimationEnd', this.__removeFromDom);
    this._root.classList.remove('float');
    this._root.classList.add('puff');
  }
  _slotFloat() {
    this._root.classList.remove('pop');
    this._root.classList.add('float');
    this._root.removeEventListener('animationEnd', this.__slotFloat);
    this._root.removeEventListener('webkitAnimationEnd', this.__slotFloat);
  }
  _removeFromDom() {
    this._root.removeEventListener('animationEnd', this.__removeFromDom);
    this._root.removeEventListener('webkitAnimationEnd', this.__removeFromDom);
    this._root.parentNode.removeChild(this._root);
  }

  // >>>
  @socket.eventHandler('game:start')
  // <<<
  _onGameStart() {
    this._root.classList.remove('float');
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
    this.model = { player: player };
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
    this._root.classList.remove('fold');
    this._root.classList.remove('thinking');
    this._root.classList.remove('broke');
    switch (this._state) {
    case PLAYER_STATES.WAITING:
      this.player.status = 'waiting';
      break;
    case PLAYER_STATES.THINKING:
      this._root.classList.add('thinking');
      this.player.status = 'thinking';
      break;
    case PLAYER_STATES.CHECK:
      this.player.status = 'check';
      break;
    case PLAYER_STATES.CALL:
      this.player.status = 'call';
      break;
    case PLAYER_STATES.RAISE:
      this.player.status = 'raise!';
      break;
    case PLAYER_STATES.FOLD:
      this._root.classList.add('fold');
      this.player.status = 'fold';
      break;
    case PLAYER_STATES.IDLE:
      this.player.status = 'not ready';
      break;
    case PLAYER_STATES.READY:
      this.player.status = 'ready!';
      break;
    case PLAYER_STATES.BROKE:
      this._root.classList.add('broke');
      this.player.status = 'broke!';
      break;
    }
    this.model = {player: this.player};
  }
}
