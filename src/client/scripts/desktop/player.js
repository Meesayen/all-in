/* jshint ignore:start */
import { renderSync, renderContentSync } from '../core/tpl';
import { socketEventFilter } from '../core/decorators/socket';

export default class Player {
  constructor(player, socket) {
    this._socket = socket;
    this._state = Player.IDLE_STATE;
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

    this._initComms();
  }

  static getStates() {
    return {
      IDLE_STATE: 0,
      READY_STATE: 1,
      WAITING_STATE: 2,
      THINKING_STATE: 3,
      SMALL_BLIND_STATE: 5,
      BIG_BLIND_STATE: 6,
      FOLD_STATE: 7,
      RAISE_STATE: 9,
      CALL_STATE: 10,
      BROKE_STATE: 11,
      CHECK_STATE: 12
    };
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
  _initComms() {
    this._socket.on('game:start', this._onGameStart.bind(this));
    this._socket.on('player:info-update',this._onInfoUpdate.bind(this));
    this._socket.on('player:ready', this._onReady.bind(this));

    // Game actions
    this._socket.on('player:check', this._onCheck.bind(this));
    this._socket.on('player:call', this._onCall.bind(this));
    this._socket.on('player:raise', this._onRaise.bind(this));
    this._socket.on('player:fold', this._onFold.bind(this));
    this._socket.on('player:thinking', this._onThinking.bind(this));
    this._socket.on('player:waiting', this._onWaiting.bind(this));
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

  _onGameStart() {
    this._root.classList.remove('float');
  }

  @socketEventFilter('id')
  _onInfoUpdate(player) {
    switch (player.state) {
    case Player.WAITING_STATE:
      player.status = 'waiting';
      break;
    case Player.THINKING_STATE:
      player.status = 'thinking';
      break;
    case Player.READY_STATE:
      player.status = 'ready!';
      break;
    case Player.FOLD_STATE:
      player.status = 'fold';
      break;
    case Player.BROKE_STATE:
      break;
    default:
      player.status = this.player.status;
      break;
    }
    this.model = { player: player };
  }

  @socketEventFilter('id')
  _onReady() {
    this.state = Player.getStates().READY_STATE;
  }

  @socketEventFilter('id')
  _onCheck() {
    this.state = Player.getStates().CHECK_STATE;
  }

  @socketEventFilter('id')
  _onCall() {
    console.log('onCall');
    this.state = Player.getStates().CALL_STATE;
  }

  @socketEventFilter('id')
  _onRaise() {
    this.state = Player.getStates().RAISE_STATE;
  }

  @socketEventFilter('id')
  _onFold() {
    this.state = Player.getStates().FOLD_STATE;
  }

  @socketEventFilter('id')
  _onWaiting() {
    this.state = Player.getStates().WAITING_STATE;
  }

  @socketEventFilter('id')
  _onThinking() {
    this.state = Player.getStates().THINKING_STATE;
  }

  _updateState() {
    this._root.classList.remove('fold');
    this._root.classList.remove('thinking');
    this._root.classList.remove('broke');
    switch (this._state) {
    case Player.getStates().WAITING_STATE:
      this.player.status = 'waiting';
      break;
    case Player.getStates().THINKING_STATE:
      this._root.classList.add('thinking');
      this.player.status = 'thinking';
      break;
    case Player.getStates().CHECK_STATE:
      this.player.status = 'check';
      break;
    case Player.getStates().CALL_STATE:
      this.player.status = 'call';
      break;
    case Player.getStates().RAISE_STATE:
      this.player.status = 'raise!';
      break;
    case Player.getStates().FOLD_STATE:
      this._root.classList.add('fold');
      this.player.status = 'fold';
      break;
    case Player.getStates().IDLE_STATE:
      this.player.status = 'not ready';
      break;
    case Player.getStates().READY_STATE:
      this.player.status = 'ready!';
      break;
    case Player.getStates().BROKE_STATE:
      this._root.classList.add('broke');
      this.player.status = 'broke!';
      break;
    }
    this.model = {player: this.player};
  }
}
