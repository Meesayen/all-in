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
    this.$.buttons.classList.add('disabled');
  }

  // >>>
  @socket.eventHandler('player:my-turn')
  // <<<
  _handleMyTurn() {
    this.$.buttons.classList.remove('disabled');
  }
}


// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Table.prototype.is = 'ai-mobile-table';

document.registerElement('ai-mobile-table', Polymer.Class(Table.prototype));
