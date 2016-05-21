import { communicator, eventHandler } from 'lib/decorators/socket';

@communicator
class MobileTable {
  beforeRegister() {
    this.is = 'ai-table';
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

  @eventHandler('player:new-card')
  _handleNewCard(card) {
    let cardEl = document.createElement('ai-card');
    cardEl.value = card.value;
    cardEl.suit = card.seed;
    this.$.cards.appendChild(cardEl);
  }

  @eventHandler('player:wait-to-bet')
  @eventHandler('player:ack-bet')
  _handleWaitToBet() {
    this.$.buttons.classList.add('disabled');
  }

  @eventHandler('player:my-turn')
  _handleMyTurn() {
    this.$.buttons.classList.remove('disabled');
  }
}

Polymer(MobileTable);
