// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import * as socket from '../../js/core/decorators/socket'; // jshint ignore:line

// >>>
@socket.communicator
// <<<
class Table {
  constructor() {
  }

  ready() {
    this.classList.add('hidden');
  }

  show() {
    this.classList.remove('hidden');
  }

  onAction(e) {
    switch (e.detail.type) {
      case 'check':
        this.socket.emit('player:check');
        break;
      case 'call':
        this.socket.emit('player:call');
        break;
      case 'raise':
        this.socket.emit('player:raise', { amount: e.detail.amount});
        break;
      case 'fold':
        this.socket.emit('player:fold');
        break;
      default:

    }
  }

  // >>>
  @socket.eventHandler('player:new-card')
  // <<<
  _handleNewCard(card) {
    let cardEl = document.createElement('ai-card');
    cardEl.value = card.value;
    cardEl.suit = card.seed;
    this.$.cards.appendChild(cardEl);
  }

  // >>>
  @socket.eventHandler('player:wait-to-bet')
  @socket.eventHandler('player:ack-bet')
  // <<<
  _handleWaitToBet() {
    this.$.actionPad.classList.add('disabled');
  }

  // >>>
  @socket.eventHandler('player:my-turn')
  // <<<
  _handleMyTurn(player) {
    this.playerState = player.state;
    this.$.actionPad.classList.remove('disabled');
  }
}


// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Table.prototype.is = 'ai-mobile-table';

document.registerElement('ai-mobile-table', Polymer.Class(Table.prototype));
