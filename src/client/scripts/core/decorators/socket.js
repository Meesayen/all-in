export function socketEventHandler(/*id*/) {
  return function(/*target, name, descriptor*/) {
    // TODO
  };
}
export function socketEventFilter(id) {
  return function(target, name, descriptor) {
    let fn = descriptor.value;
    descriptor.value = function(data) {
      if (this[id] === data[id]) {
        fn.call(this, data);
      }
    };
  };
}
