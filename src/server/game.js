import { EventEmitter } from 'events';
import Player from './player';
import { STATES as PLAYER_STATES } from './player';
import Deck from './deck';

const GAME_PHASES = {
  LOBBY: 0,
  READY_TO_PLAY: 1,
  IDLE: 2,
  PRE_FLOP: 3,
  FLOP: 4,
  TURN: 5,
  RIVER: 6,
  RESULT: 7
};

const MIN_PLAYERS = 2;
const INITIAL_BALANCE = 25000;


export default class Game extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this._availableSeats = [
      'player1', 'player2', 'player3', 'player4'
    ];
    this.players = {
      'player1': null,
      'player2': null,
      'player3': null,
      'player4': null
    };
    this.playersInGame = 0;

    this.deck = null;

    this.table = {
      players: [],
      cards: [],
      dealer: null,
      currentPlayer: null
    };

    this.state = GAME_PHASES.LOBBY;

    this.tableInfo = {
      minBet: 100,
      amount: 0
    };

    this.deck = new Deck();
    this._initComms();
  }

  _initComms() {
    this.socket.on('disconnect', this._handleDisconnect.bind(this));
    this.socket.on('web:start', this._handleGameStart.bind(this));
  }

  addPlayer(socket) {
    let id = this._availableSeats.shift();
    this.playersInGame++;

    if(id !== undefined) {
      let player = new Player({
        socket: socket,
        id: id,
        nickname: 'Player ' + (id.substr(-1)),
        balance: INITIAL_BALANCE,
        table: this.tableInfo
      });

      this.players[id] = player;

      this.socket.emit('game:player-joined', {
        id: player.id,
        nickname: player.nickname,
        cash: player.balance
      });

      player.on('disconnection', this._handlePlayerDisconnection.bind(this));
      player.on('info-update', this._handlePlayerInfoUpdate.bind(this));
      player.on('ready', this._handlePlayerReady.bind(this));

      player.on('update', this._handlePlayerUpdate.bind(this));
      player.on('check', this._handlePlayerCheck.bind(this));
      player.on('call', this._handlePlayerCall.bind(this));
      player.on('raise', this._handlePlayerRaise.bind(this));
      player.on('all-in', this._handlePlayerAllIn.bind(this));
      player.on('fold', this._handlePlayerFold.bind(this));
    }
  }

  removePlayer(id) {
    this.playersInGame--;
    this._availableSeats.unshift(id);
    this.players[id] = null;

    this.socket.emit('game:player-left', {
      id: id
    });
  }

  get availableSeatsCount() {
    return this._availableSeats.length;
  }

  checkReadyPlayers() {
    let ready = true;
    if (this.playersInGame >= MIN_PLAYERS) {
      for (let k in this.players) {
        let player = this.players[k];
        if (player && player.ready === false) {
          ready = false;
          break;
        }
      }
    } else {
      ready = false;
    }

    if (ready && this.state === GAME_PHASES.LOBBY) {
      this._changePhase(GAME_PHASES.READY_TO_PLAY);
    } else if (!ready && this.state === GAME_PHASES.READY_TO_PLAY) {
      this._changePhase(GAME_PHASES.LOBBY);
    }
  }
  _handleDisconnect() {
    console.log('game disconnection');
  }
  _handlePlayerDisconnection(player) {
    this.removePlayer(player.id);
    this.checkReadyPlayers();
    if (this.state === GAME_PHASES.LOBBY) {
      // remove and check ready
    } else {
      // start idle timer
      // if the time runs up the P auto-folds and will be out until reconnection
    }
  }
  _handlePlayerInfoUpdate(player) {
    this.socket.emit('player:info-update', player);
  }
  _handlePlayerReady(player) {
    this.checkReadyPlayers();
    this.socket.emit('player:ready', player);
  }
  _changePhase(phase) {
    this.state = phase;
    switch (phase) {
    case GAME_PHASES.LOBBY:
      this.socket.emit('game:not-ready-to-play');
      break;
    case GAME_PHASES.READY_TO_PLAY:
      this.socket.emit('game:ready-to-play');
      break;
    case GAME_PHASES.IDLE:
      break;
    case GAME_PHASES.PRE_FLOP:
      this._manageBlinds();
      break;
    case GAME_PHASES.FLOP:
      this._serveFlop();
      break;
    case GAME_PHASES.TURN:
      this._serveTurn();
      break;
    case GAME_PHASES.RIVER:
      this._serveRiver();
      break;
    case GAME_PHASES.RESULT:
      break;
    }
  }

  _nextPlayer() {
    this.table.currentPlayer++;
    if (this.table.currentPlayer === this.table.players.length) {
      this.table.currentPlayer = 0;
    }
    return this.table.players[this.table.currentPlayer];
  }


  /* Round Start Process */

  _handleGameStart() {
    for (let i in this.players) {
      let player = this.players[i];
      if (player !== null) {
        player.handleGameStart();
      }
    }
    this._startGame();

    //TODO make token unavailable to ensure this session can't be joined anymore
  }

  _startGame() {
    let playersInfo = [];
    this.deck.shuffle();

    for (let k in this.players) {
      let player = this.players[k];
      if (player) {
        this.table.players.push(player);
      }
    }

    this.table.players.forEach(player => {
      player.takeCard(this.deck.pick());
      player.takeCard(this.deck.pick());
      player.setState(PLAYER_STATES.WAITING);

      playersInfo.push({
        id: player.id,
        balance: player.balance,
        nickname: player.nickname,
        status: player.status
      });

      this.socket.emit('player:waiting', {id: player.id});
    });

    this.table.dealer = 0;
    this.table.currentPlayer = 0;

    this.socket.emit('game:start', {
      players: playersInfo
    });

    this._changePhase(GAME_PHASES.PRE_FLOP);
  }

  _manageBlinds() {
    let smallBlinder = this._nextPlayer();
    let bigBlinder = this._nextPlayer();
    let onTheShot = this._nextPlayer();

    this.tableInfo.amount += smallBlinder.doSmallBlind();
    this.tableInfo.amount += bigBlinder.doBigBlind();
    onTheShot.setState(PLAYER_STATES.THINKING);
    this.socket.emit('player:thinking', {id: onTheShot.id});
  }


  /* Player Round Actions */

  _handlePlayerUpdate(player) {
    this.socket.emit('player:update', player);
  }

  _handlePlayerCheck(data) {
    this.socket.emit('player:check', {id: data.id});
    if (this.state === GAME_PHASES.PRE_FLOP) {
      this._changePhase(GAME_PHASES.FLOP);
    } else {
      let player = this._nextPlayer();
      if (player.state === PLAYER_STATES.CHECK) {
        this._nextPhase();
      } else {
        player.setState(PLAYER_STATES.THINKING);
        this.socket.emit('player:thinking', {id: player.id});
      }
    }
  }
  _handlePlayerCall(data) {
    this.socket.emit('player:call', {id: data.id});
    let player = this._nextPlayer();
    if (player.state === PLAYER_STATES.BET_DONE) {
      this._nextPhase();
    } else {
      player.setState(PLAYER_STATES.THINKING);
      this.socket.emit('player:thinking', {id: player.id});
    }
  }
  _handlePlayerRaise(data) {
    this.socket.emit('player:raise', {id: data.id, bet: data.bet});
    let player = this._nextPlayer();
    if (player.state === PLAYER_STATES.BET_DONE) {
      this._nextPhase();
    } else {
      player.setState(PLAYER_STATES.THINKING);
      this.socket.emit('player:thinking', {id: player.id});
    }
  }

  _handlePlayerAllIn(/*player*/) {}

  _handlePlayerFold(data) {
    this.socket.emit('player:fold', {id: data.id});
    let player = this._nextPlayer();
    if (player.state === PLAYER_STATES.BET_DONE) {
      this._nextPhase();
    } else {
      player.setState(PLAYER_STATES.THINKING);
      this.socket.emit('player:thinking', {id: player.id});
    }
  }

  _handleEndTurn() {

  }
  _nextPhase() {
    if (this.state === GAME_PHASES.RIVER) {
      this._handleEndTurn();
    } else {
      this._changePhase(this.state + 1);
    }
  }
  _serveFlop() {
    for (let i = 0; i < 3; i++) {
      let card = this.deck.pick();
      this.table.cards.push(card);
    }
    this.socket.emit('game:draw-flop', this.table.cards);

    this.table.players.forEach(player => {
      player.setState(PLAYER_STATES.WAITING);
      this.socket.emit('player:waiting', {id: player.id});
    });

    this.table.dealer = 0;
    let player = this._nextPlayer();
    player.setState(PLAYER_STATES.THINKING);
    this.socket.emit('player:thinking', {id: player.id});
  }
  _serveTurn() {
    let card = this.deck.pick();
    this.table.cards.push(card);
    this.socket.emit('game:draw-turn', card);

    this.table.players.forEach(player => {
      player.setState(PLAYER_STATES.WAITING);
      this.socket.emit('player:waiting', {id: player.id});
    });

    this.table.dealer = 0;
    let player = this._nextPlayer();
    player.setState(PLAYER_STATES.THINKING);
    this.socket.emit('player:thinking', {id: player.id});
  }
  _serveRiver() {
    let card = this.deck.pick();
    this.table.cards.push(card);
    this.socket.emit('game:draw-river', card);

    this.table.players.forEach(player => {
      player.setState(PLAYER_STATES.WAITING);
      this.socket.emit('player:waiting', {id: player.id});
    });

    this.table.currentPlayer = this.table.dealer;
    let player = this._nextPlayer();
    player.setState(PLAYER_STATES.THINKING);
    this.socket.emit('player:thinking', {id: player.id});
  }

  _nextRound() {
    this.table.dealer++;
    this.table.currentPlayer = this.table.dealer;
    this.socket.emit('game:new-round');
  }
}
