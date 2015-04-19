var
  EventEmitter = require("events").EventEmitter,
  util = require("util");

var SEEDS = [
  'hearts',
  'diamonds',
  'spades',
  'clubs'
];

var VALUES = [
  'A', '2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'J', 'Q', 'K'
];

var Card = function(seed, value) {
  this.seed = seed;
  this.value = value;
};

var Deck = function(o) {
  Deck.super_.call(this);
  this.cards = [];
  this.init(o);
};

util.inherits(Deck, EventEmitter);

Deck.prototype.init = function(o) {
  this.shuffle();
};
Deck.prototype.shuffle = function(o) {
  this.cards = [];
  for (var i = 0, seed; seed = SEEDS[i]; i++) {
    for (var j = 0, value; value = VALUES[j]; j++) {
      this.cards.push(new Card(seed, value));
    }
  }
};
Deck.prototype.pick = function() {
  var randIdx = Math.floor(Math.random() * this.cards.length);
  var card = this.cards.splice(randIdx, 1)[0];
  return card;
};

module.exports = Deck;
