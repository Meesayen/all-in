let map = new WeakMap();
export function communicator(target) {
  let listenersMap = map.get(target);
  Object.defineProperty(target.prototype, 'initializeSocketComm', {
    value: function(socket) {
      if (listenersMap) {
        Object.keys(listenersMap).forEach(key => {
          socket.on(key, this[listenersMap[key]].bind(this));
        });
      }
    }
  });
}
export function eventHandler(id) {
  return function(target, name /*, descriptor*/) {
    if (!map.get(target.constructor)) {
      map.set(target.constructor, {});
    }
    map.get(target.constructor)[id] = name;
  };
}
export function eventFilter(id) {
  return function(target, name, descriptor) {
    let fn = descriptor.value;
    descriptor.value = function(data) {
      if (this[id] === data[id]) {
        fn.call(this, data);
      }
    };
  };
}
