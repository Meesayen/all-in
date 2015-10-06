import { EventEmitter } from 'events';
import Game from './game';
import Hashids from 'hashids';

const SEED = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
let hashids = new Hashids('Pwning Pwnies Total Pwnage', 5, SEED);


export default class GameServer extends EventEmitter {
  constructor(ws) {
    super();
    this.ws = ws;
    this.games = {};
  }

  init() {
    this._initComms();
  }

  _initComms() {
    this.ws.on('connection', this._handleSocketConnection.bind(this));
  }

  _handleSocketConnection(socket) {
    socket.on('web:connection', () => {
      this._handleDesktopConnection(socket);
    });
    socket.on('device:connection', data => {
      this._handleDeviceConnection(socket, data);
    });
  }

  _handleDesktopConnection(socket) {
    let d = new Date();
    let id = hashids.encode(parseInt(`1${d.getMinutes()}${d.getSeconds()}`, 10));
    let game = new Game(socket);
    this.games[id] = game;
    socket.emit('game:tokenized', { token: id });
  }

  _handleDeviceConnection(socket, data) {
    let game = this.games[data.token];
    if (game === undefined) {
      socket.emit('game:wrongtoken', {
        message: 'Wrong Token'
      });
    } else if (game.availableSeatsCount === 0) {
      socket.emit('game:lobbyfull', {
        message: 'The Lobby is currently full.' +
          '<br>Only 4 players at once are allowed to join in.'
      });
    } else {
      game.addPlayer(socket);
    }
  }
}
