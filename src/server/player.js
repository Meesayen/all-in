import { EventEmitter } from 'events';

// Player Games States
export const STATES = {
  LOBBY: 0,
  IDLE: 1,
  WAITING: 2,
  THINKING: 3,
  BET_DONE: 4,
  SMALL_BLIND: 5,
  BIG_BLIND: 6,
  FOLDED: 7
};

export default class Player extends EventEmitter {
  constructor(o) {
    super();
    this.id = o.id;
    this.nickname = o.nickname;
    this.balance = o.balance;
    this.socket = o.socket;
    this.table = o.table;
    this.state = STATES.LOBBY;
    this.ready = false;
    this.cards = [];

    this.socket.emit('game:connected', {
      nickname: this.nickname,
      balance: this.balance,
      id: this.id
    });
    this._initComms();
  }

  _initComms() {
    this.socket.on('disconnect', this._handleDisconnect.bind(this));
    this.socket.on('player:ready', this._handleReady.bind(this));
    this.socket.on('player:info-update', this._handleInfoUpdate.bind(this));

    // Game actions
    this.socket.on('player:check', this._handleCheck.bind(this));
    this.socket.on('player:call', this._handleCall.bind(this));
    this.socket.on('player:raise', this._handleRaise.bind(this));
    this.socket.on('player:fold', this._handleFold.bind(this));
  }

  _changeState(state) {
    this.state = state;
    switch (state) {
    case STATES.LOBBY:
      break;
    case STATES.WAITING:
      this.socket.emit('player:wait-to-bet');
      break;
    case STATES.THINKING:
      this.socket.emit('player:my-turn');
      break;
    case STATES.SMALL_BLIND:
      this.socket.emit('player:my-turn', { state: 'small-blind' });
      break;
    case STATES.BIG_BLIND:
      this.socket.emit('player:my-turn', { state: 'big-blind' });
      break;
    case STATES.BET_DONE:
      this.socket.emit('player:ack-bet');
      break;
    case STATES.FOLDED:
      this.socket.emit('player:ack-fold');
      break;
    case STATES.IDLE:
    default:
    }
  }
  _handleDisconnect() {
    this.emit('disconnection', {
      id: this.id
    });
  }
  _handleReady() {
    this.ready = true;
    this.emit('ready', {
      id: this.id
    });
    this.socket.emit('player:ack-ready');
  }
  _handleInfoUpdate(data) {
    this.nickname = data.nickname;
    this.emit('info-update', {
      id: this.id,
      cash: this.balance,
      nickname: this.nickname
    });
    this.emit('update', this.info);
  }
  _emitUpdate() {
    this.emit('update', {
      id: this.id,
      balance: this.balance,
      nickname: this.nickname,
      status: this.status
    });
  }

  handleGameStart() {
    this.socket.emit('game:start');
    this.cards = [];
  }

  setState(state) {
    this._changeState(state);
  }
  doSmallBlind() {
    let bet = this.table.minBet / 2;
    let info = this.info;
    this.balance -= bet;
    info.bet = bet;
    this.state = STATES.SMALL_BLIND;
    this.emit('update', info);
    return bet;
  }
  doBigBlind() {
    let bet = this.table.minBet;
    let info = this.info;
    this.balance -= bet;
    info.bet = bet;
    this.state = STATES.BIG_BLIND;
    this.emit('update', info);
    return bet;
  }

  takeCard(card) {
    this.cards.push(card);
    this.socket.emit('player:new-card', card);
  }

  _handleCheck() {
    this.emit('check', this);
    this._changeState(STATES.CHECK);
  }

  _handleCall() {
    this._changeState(STATES.BET_DONE);
    this.emit('call', this);
    this.balance -= this.table.minBet;
    let info = this.info;
    info.betType = 'call';
    this.emit('update', info);
  }
  _handleRaise(amount) {
    this._changeState(STATES.BET_DONE);
    this.emit('raise', {
      id: this.id,
      amount
    });
    this.balance -= amount;
    let info = this.info;
    info.betType = 'raise';
    info.bet = amount;
    this.emit('update', info);
  }
  _handleFold() {
    this._changeState(STATES.FOLDED);
    this.emit('fold', { id: this.id });
    this.emit('update', this.info);
  }
  get info() {
    return {
      id: this.id,
      nickname: this.nickname,
      cash: this.balance,
      state: this.state
    };
  }
}
