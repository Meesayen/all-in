import { EventEmitter } from 'events';

const SEEDS = [
  'H',
  'D',
  'S',
  'C'
];

const VALUES = [
  'A', '2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'J', 'Q', 'K'
];

class Card {
  constructor(seed, value) {
    this.seed = seed;
    this.value = value;
  }
}

export default class Deck extends EventEmitter {
  constructor() {
    super();
    this.cards = [];
    this.shuffle();
  }
  shuffle() {
    this.cards = [];
    SEEDS.forEach(seed => {
      VALUES.forEach(value => {
        this.cards.push(new Card(seed, value));
      });
    });
  }
  pick() {
    let randIdx = Math.floor(Math.random() * this.cards.length);
    let card = this.cards.splice(randIdx, 1)[0];
    return card;
  }
}
