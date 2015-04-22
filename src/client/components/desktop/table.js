/* global Polymer */

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

  // >>>
  @socket.eventHandler('game:draw-flop')
  // <<<
  _handleDrawFlop(flopCards) {
    flopCards.map(card => {
      let cardEl = document.createElement('ai-card');
      cardEl.value = card.value;
      cardEl.suit = card.seed;
      return cardEl;
    }).forEach(cardEl => {
      this.$.cards.appendChild(cardEl);
    });
  }
}


// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Table.prototype.is = 'ai-table';

document.registerElement('ai-table', Polymer.Class(Table.prototype));
