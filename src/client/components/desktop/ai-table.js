// TODO remove ugly >>> <<< comments as soon as decorators will behave
// with jshint, or at least with its ignore:line directive

import {communicator, eventHandler} from 'lib/decorators/socket'; // jshint ignore:line

// >>>
@communicator
// <<<
class Table {
  beforeRegister() {
    this.is = 'ai-table';
  }

  ready() {
    this.classList.add('hidden');
  }

  show() {
    this.classList.remove('hidden');
  }

  // >>>
  @eventHandler('game:draw-flop')
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

/* jshint -W064 */
Polymer(Table);
