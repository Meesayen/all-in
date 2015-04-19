/* global io */

class MobileClient {
  constructor() {
    this.socket = io();
    this.nickname = null;
    this.balance = null;
    this.token = null;
  }
  init() {
    let doc = document;
    this.page = doc.querySelector('.page');
    this.page.style.height = window.screen.height + 'px';
    this.btnNext = doc.querySelector('.button.next');

    this.lobby = doc.querySelector('#lobby');
    this.gameTable = doc.querySelector('#game-table');

    this.tokenInput = doc.querySelector('.token');
    this.nicknameInput = doc.querySelector('.player-info[name="nickname"]');

    this.cards = [].slice.apply(doc.querySelectorAll('.card'));
    this.callBtn = doc.querySelector('.call');
    this.raiseBtn = doc.querySelector('.raise');
    this.foldBtn = doc.querySelector('.fold');

    this.raiseSlider = doc.querySelector('#raise-slider');

    this.notice = doc.querySelector('.notice');
    this._initComms();
    this._addCallbacks();
  }

  _addCallbacks() {
    this.btnNext.addEventListener('click', this._onNext.bind(this));
    this.nicknameInput.addEventListener('keyup', this._onUpdate.bind(this));
    this.callBtn.addEventListener('click', this._onCall.bind(this));
    this.raiseBtn.addEventListener('click', this._onRaise.bind(this));
    this.foldBtn.addEventListener('click', this._onFold.bind(this));
  }

  _initComms() {
    this.socket.on('game:connected', this._handleConnection.bind(this));
    this.socket.on('game:wrongtoken', this._handleWrongToken.bind(this));
    this.socket.on('game:lobbyfull', this._handleFullLobby.bind(this));
    this.socket.on('player:ack-ready', this._handleAckReady.bind(this));
    this.socket.on('game:start', this._handleGameStart.bind(this));

    this.socket.on('player:new-card', this._handleNewCard.bind(this));
    this.socket.on('player:wait-to-bet', this._handleWaitToBet.bind(this));
    this.socket.on('player:ack-bet', this._handleWaitToBet.bind(this));
    this.socket.on('player:my-turn', this._handleMyTurn.bind(this));
  }

  _onNext() {
    var phase = this.page.dataset.phase;
    if (phase === 'token-request') {
      this._sendToken();
    } else if (phase === 'info-update') {
      this._sendReady();
    } else {
      this.socket.emit('player:ready');
    }
  }

  _sendToken() {
    this.btnNext.classList.add('loading');
    this.token = this.tokenInput.value.toUpperCase();
    this.socket.emit('device:connection', { token:  this.token });
  }

  _sendReady() {
    this.socket.emit('player:ready');
  }

  _onUpdate() {
    // TODO gravatar
    let nickname = this.nicknameInput.value;
    this.socket.emit('player:info-update', { nickname });
  }

  _onCheck() {
    this.socket.emit('player:check');
  }
  _onCall() {
    this.socket.emit('player:call');
  }
  _onRaise() {
    let amount = this.raiseSlider.value;
    this.socket.emit('player:raise', { amount });
  }
  _onFold() {
    this.socket.emit('player:fold');
  }

  _handleConnection(player) {
    this.nickname = player.nickname;
    this.balance = player.balance;
    this.nicknameInput.value = this.nickname;
    this.page.dataset.playerId = player.id;
    this.btnNext.classList.remove('loading');

    this.page.dataset.phase = 'info-update';
    this.btnNext.textContent = 'READY';
  }

  _handleWrongToken(data) {
    this.tokenInput.value = '';
    this.showNotice(data.message);
  }

  _handleFullLobby(data) {
    this.showNotice(data.message);
  }

  _handleAckReady() {
    this.page.dataset.phase = 'waiting';
  }

  _handleGameStart() {
    console.log('Game Started');
    this.lobby.style.display = 'none';
    this.gameTable.style.display = 'block';
  }
  _handleNewCard(card) {
    console.log(card);
    let cardEl = this.cards.shift();
    cardEl.dataset.seed = card.seed;
    cardEl.querySelector('.value').textContent = card.value;
  }
  _handleWaitToBet() {
    this.callBtn.classList.add('disabled');
    this.raiseBtn.classList.add('disabled');
    this.foldBtn.classList.add('disabled');
  }
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
      this.btnSubmit.classList.remove('loading');
    }, 4000);
  }
}

let mc = new MobileClient();
mc.init();
