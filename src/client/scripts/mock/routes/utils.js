import { helpers } from '../lib/faker';

var fill = (n, l) => {
  while (n > 0) {
    n--;
    l.push(true);
  }
  return l;
};

export var list = (n, produce) => {
  var l = fill(n, []);
  return l.map(produce);
};

export var randomList = (n, produce) => {
  var l = fill(helpers.randomNumber(n), []);
  return l.map(produce);
};
