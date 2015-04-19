/*!
 *
 * The Store is used to handle all the requests the app will make, in a fancy
 * Promise'd way.
 * Store will need a "registry" object containing description of the requests
 * the app will make.
 * Each entry in the registry could be a single call, or a combination of
 * multiple chainable calls.
 *
 * TODO:
 *  - Plain request, passing in a URL and an optional data object.
 *  - Data aggregation in combo entries.
 *
 *
 * ENTRY OPTIONS:
 *   url: a fully qualified uri
 *   headers: http headers (default: {})
 *   data: JSON object descriptive of the data to be sent
 *   type: a string enum. html, xml, json, or jsonp
 *   contentType: sets the Content-Type of the request. Eg: application/json
 *   crossOrigin: for cross-origin requests for browsers that support it
 *   jsonpCallback: Specify the callback function name for a JSONP request
 *   nocache: boolean, every request will be made anew
 *   real: (development environment only) boolean, it instructs the Store class
 *         to temporarily disable the mock server for that specific request
 *
 * COMBO RELATED OPTIONS:
 *   id: identifier of a previously defined registry entry
 *   map: object used to define mapping relation between the current entry data
 *     and the previous one.
 *
 * COMBO EXAMPLE:
 *   'combo': [{
 *     'url': '/api/first',
 *   }, {
 *     'url': '/api/second',
 *     'data': {
 *       'default': 'stuff'
 *     },
 *     'map': {
 *       'deeply.nested.key': 'extra'
 *     }
 *   }]
 *
 *   assuming that a call to '/api/first' produces a json like:
 *   {
 *     deeply: {
 *       nested: {
 *         key: 'extraInfo'
 *       }
 *     }
 *   }
 *
 *   the value of the json.deeply.nested.key will be passed to the key
 *   'extra' of the data object for the call to '/api/second'.
 *
 */


/* global reqwest */
import { serialize, clone, lookup, async } from './utils';

var
  req = reqwest,
  registry = null;

var extendProps = function(props, data={}) {
  if (!props.data) {
    props.data = {};
  }
  Object.keys(data).forEach(k => {
    if (k[0] === ':') {
      props.url = props.url.replace(k, data[k]);
    } else {
      props.data[k] = data[k];
    }
  });
};

// mockServer noop for production environment
var _mockServer = window['mockServer'] || {
  shutdown: function() {},
  restart: function() {}
};

/**
 * Helper class that takes care of the communication with remote APIs. It will
 * be treated as a Singleton whenever an external module requires it as a
 * dependency.
 */
export default class Store {
  constructor(_registry) {
    this._cache = {};
    registry = _registry;
    if (!registry || typeof registry !== 'object') {
      console.log('No valid registry was passed to the Store constructor.');
    }
  }

  /**
   * Method to asynchronously fetch data from a remote service.
   *
   * @param  {String} id: A string identifier for remote resource descriptor
   *                      registered in the storeRegistry.
   * @param  {Object} data: Optional data object which overrides default data
   *                        defined in the resource descriptor.
   * @return {Promise}
   */
  get(id, data, opts={}) {
    var
      cache = this._cache,
      regProps = clone(registry[id]),
      mapProps = null,
      comboData = null,
      cacheId = data ? id + serialize(data) : id,
      comboProps;

    if (cache[cacheId] && !regProps.nocache && !opts.nocache) {
      return cache[cacheId];
    }

    if (regProps instanceof Array) {
      cache[cacheId] = async(function* asyncGetCombo() {
        try {
          while((comboProps = regProps.shift())) {
            mapProps = comboProps.map || null;
            if (comboProps.id) {
              comboProps = registry[comboProps.id];
            }
            if (mapProps !== null) {
              for (var k in mapProps) {
                if (mapProps.hasOwnProperty(k)) {
                  comboProps.data[mapProps[k]] = lookup(comboData, k);
                }
              }
            }
            mapProps = null;
            extendProps(comboProps, data);
            if (comboProps.real || opts.real) {
              _mockServer.shutdown();
            }
            comboData = yield req(comboProps);
            _mockServer.restart();
          }
          return comboData;
        } catch(err) {
          throw err;
        }
      });
    } else {
      cache[cacheId] = async(function* asyncGet() {
        var res;
        try {
          extendProps(regProps, data);
          if (regProps.real || opts.real) {
            _mockServer.shutdown();
          }
          res = yield req(regProps);
          _mockServer.restart();
          return res;
        } catch(err) {
          throw err;
        }
      });
    }
    return cache[cacheId];
  }

  post(id, data) {
    // TODO
    console.log(id, data);
  }
}
