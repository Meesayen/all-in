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
    this.page = doc.querySelector('.page');
    this.page.style.height = window.screen.height + 'px';
    this.btnNext = doc.querySelector('.button.next');

    this.lobby = doc.querySelector('#lobby');
    this.gameTable = doc.querySelector('#game-table');

    this.tokenInput = doc.querySelector('.token');
    this.nicknameInput = doc.querySelector('.player-info[name="nickname"]');

    this.callBtn = doc.querySelector('.call');
    this.raiseBtn = doc.querySelector('.raise');
    this.foldBtn = doc.querySelector('.fold');

    this.raiseSlider = doc.querySelector('#raise-slider');

    this.notice = doc.querySelector('.notice');
    this._addCallbacks();
  }

  _addCallbacks() {
    this.btnNext.addEventListener('click', this._onNext.bind(this));
    this.nicknameInput.addEventListener('keyup', this._onUpdate.bind(this));
    this.callBtn.addEventListener('click', this._onCall.bind(this));
    this.raiseBtn.addEventListener('click', this._onRaise.bind(this));
    this.foldBtn.addEventListener('click', this._onFold.bind(this));
  }

  _onNext() {
    let phase = this.page.dataset.phase;
    if (phase === 'token-request') {
      this._sendToken();
    } else if (phase === 'info-update') {
      this._sendReady();
    } else {
      this._socket.emit('player:ready');
    }
  }

  _sendToken() {
    this.btnNext.classList.add('loading');
    this.token = this.tokenInput.value.toUpperCase();
    this._socket.emit('device:connection', { token:  this.token });
  }

  _sendReady() {
    this._socket.emit('player:ready');
  }

  _onUpdate() {
    // TODO gravatar
    let nickname = this.nicknameInput.value;
    this._socket.emit('player:info-update', { nickname });
  }

  _onCheck() {
    this._socket.emit('player:check');
  }
  _onCall() {
    this._socket.emit('player:call');
  }
  _onRaise() {
    let amount = this.raiseSlider.value;
    this._socket.emit('player:raise', { amount });
  }
  _onFold() {
    this._socket.emit('player:fold');
  }

  // >>>
  @socket.eventHandler('game:connected')
  // <<<
  _handleConnection(player) {
    this.nickname = player.nickname;
    this.balance = player.balance;
    this.nicknameInput.value = this.nickname;
    this.page.dataset.playerId = player.id;
    this.btnNext.classList.remove('loading');

    this.page.dataset.phase = 'info-update';
    this.btnNext.textContent = 'READY';
  }

  // >>>
  @socket.eventHandler('game:wrongtoken')
  // <<<
  _handleWrongToken(data) {
    this.tokenInput.value = '';
    this.showNotice(data.message);
  }

  // >>>
  @socket.eventHandler('game:lobbyfull')
  // <<<
  _handleFullLobby(data) {
    this.showNotice(data.message);
  }

  // >>>
  @socket.eventHandler('game:start')
  // <<<
  _handleGameStart() {
    console.log('Game Started');
    this.lobby.style.display = 'none';
    this.gameTable.style.display = 'block';
  }

  // >>>
  @socket.eventHandler('player:ack-ready')
  // <<<
  _handleAckReady() {
    this.page.dataset.phase = 'waiting';
  }

  // >>>
  @socket.eventHandler('player:new-card')
  // <<<
  _handleNewCard(card) {
    let cardEl = document.createElement('ai-card');
    cardEl.value = card.value;
    cardEl.suit = card.seed;
    document.querySelector('.cards').appendChild(cardEl);
  }

  // >>>
  @socket.eventHandler('player:wait-to-bet')
  @socket.eventHandler('player:ack-bet')
  // <<<
  _handleWaitToBet() {
    this.callBtn.classList.add('disabled');
    this.raiseBtn.classList.add('disabled');
    this.foldBtn.classList.add('disabled');
  }

  // >>>
  @socket.eventHandler('player:my-turn')
  // <<<
  _handleMyTurn() {
    this.callBtn.classList.remove('disabled');
    this.raiseBtn.classList.remove('disabled');
    this.foldBtn.classList.remove('disabled');
  }

  showNotice(message) {
    this.notice.innerHTML = message;
    this.notice.classList.add('show');
    setTimeout(() => {
      this.notice.classList.remove('show');
      this.btnNext.classList.remove('loading');
    }, 4000);
  }
}

let mc = new MobileClient();
mc.init();
