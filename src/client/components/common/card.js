/* global Polymer */

class Card {
  created() {
    this.vw = 223.23;
    this.vh = 311.81;
    this.vx = 87;
    this.vy = 34.5;
    this.specials = {
      '#JC': '#g4130',
      '#QC': '#g4183',
      '#KC': '#g4230',
      '#JH': '#g3966',
      '#QH': '#g4021',
      '#KH': '#g4069',
      '#JS': '#g3874',
      '#QS': '#g3952',
      '#KS': '#g3963',
      '#JD': '#g3829',
      '#QD': '#g3839',
      '#KD': '#g3850'
    };
  }

  attached() {
    let yOffset = this.vh * ((this.suit === 'C' && 0.000001) ||
        (this.suit === 'H' && 1.003) ||
        (this.suit === 'S' && 2.005) ||
        (this.suit === 'D' && 3.009));
    let xOffset = this.vw * ((this.value === 'A' && 0.00001) ||
        (this.value === 'J' && 10.004) ||
        (this.value === 'Q' && 11.008) ||
        (this.value === 'K' && 12.013) ||
        this.value - 1);
    this.$.card.setAttribute('viewBox', [
      +xOffset + this.vx,
      +yOffset + this.vy,
      this.vw + 1,
      this.vh + 1
    ].join(' '));

    this.$.use.setAttributeNS(
        'http://www.w3.org/1999/xlink', 'href', this.cardValue);
  }

  get cardValue() {
    let cardValue = `#${this.value}${this.suit}`;
    return this.specials[cardValue] || cardValue;
  }
}

// Maybe with babel Stage 0 and Class properties this will
// be less ugly
Card.prototype.is = 'ai-card';
Card.prototype.properties = {
  value: String,
  suit: String
};

document.registerElement('ai-card', Polymer.Class(Card.prototype));
