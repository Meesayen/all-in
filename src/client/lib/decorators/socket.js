let map;
export function communicator(target) {
  let listenersMap = map.get(target);
  let detachedFn = target.prototype.detached || function() {};
  Object.defineProperty(target.prototype, '_initializeSocketComm', {
    value(socket) {
      if (listenersMap) {
        Object.keys(listenersMap).forEach(key => {
          socket.on(key, this[listenersMap[key]].bind(this));
        });
      }
    }
  });
  Object.defineProperty(target.prototype, 'socket', {
    set(socket) {
      this._socket = socket;
      this._initializeSocketComm(socket);
    },
    get() {
      return this._socket;
    }
  });
  Object.defineProperty(target.prototype, 'detached', {
    value() {
      console.log('TODO: remove every socket connection');
      detachedFn.apply(this, arguments);
    }
  });
}
export function eventHandler(id) {
  if (!map) {
    map = new WeakMap();
  }
  return function(target, name /*, descriptor*/) {
    if (!map.get(target.constructor)) {
      map.set(target.constructor, {});
    }
    map.get(target.constructor)[id] = name;
  };
}
export function eventFilter(id) {
  if (!map) {
    map = new WeakMap();
  }
  return function(target, name, descriptor) {
    let fn = descriptor.value;
    descriptor.value = function(data) {
      if (this[id] === data[id]) {
        fn.call(this, data);
      }
    };
  };
}
