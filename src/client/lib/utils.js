var doc = document;

/**
 * Safe Object serializer. It won't fail if undefined or null is passed, but
 * returns an empty object representation.
 *
 * @params {Object} obj
 * @return {String} A string representation of the Object passed in.
 */
export let serialize = (obj) => JSON.stringify(obj || {});

/**
 * Safe Object representation deserializer. It won't fail if undefined or null
 * is passed, but returns an empty object. It will still fail if a malformed
 * Object representation is given as the input.
 *
 * @params {String} str: Object representation string.
 * @return {Object} The deserialized Object.
 */
export let deserialize = (str) => JSON.parse(str || '{}');

/**
 * Simple deep object copy function.
 *
 * @params {Object} obj: The Object to be cloned.
 * @return {Object} Deep clone of the input Object.
 */
export let clone = (obj) => deserialize(serialize(obj));

/**
 * Object value lookup. It takes an Object and a String descriptive of the path
 * to traverse to reach the desired value.
 * i.e.
 * obj = {
 *  deep: {
 *   nested: {
 *    value: 42
 *   }
 *  }
 * }
 * path = 'deep.nested.value'
 *
 * @param  {Object} data The object in which the lookup should be performed
 * @param  {String} key The string descriptive of the value path
 * @return {Value || undefined}
 */
export let lookup = (data, key) => {
  return key.split('.').reduce((obj, keyBit) => {
    if (typeof obj === 'object') {
      return obj[keyBit];
    }
    return undefined;
  }, data);
};


let run = (g, cb) => {
  var
    it = g(),
    ret;
  (function iterate(val) {
    ret = it.next(val);
    if (!ret.done) {
      if ('then' in ret.value) {
        ret.value.then(iterate, (err) => {
          cb(err, val);
        });
      } else {
        setTimeout(() => {
          iterate(ret.value);
        }, 0);
      }
    } else {
      cb(null, val);
    }
  })();
};

/**
 * Generator runner which returns a Promise to work with.
 *
 * @param  {Generator} gen
 * @return {Promise}
 */
export let async = (gen) => {
  return new Promise((resolve, reject) => {
    run(gen, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Better, DRYer, faster way to create elements
 * @param  {String} type  Element TagName
 * @param  {Object} attrs Attributes object
 * @param  {String} text  Optional text content
 * @return {HTMLElement}
 */
export let createElement = function(type, attrs={}, text=null) {
  var el = doc.createElement(type);
  Object.keys(attrs).forEach(k => {
    if (el.hasOwnProperty(k) || k === 'class') {
      if (k === 'style') {
        if (typeof attrs[k] === 'string') {
          el.style.cssText = attrs[k];
        } else {
          el.style.cssText = Object.keys(attrs[k]).map(i => {
            return `${i}:${attrs[k][i]};`;
          }).join('');
        }
      } else {
        el.setAttribute(k, attrs[k]);
      }
    }
  });
  if (typeof text === 'string') {
    el.appendChild(doc.createTextNode(text));
  }
  return el;
};


export let toArray = (arrayLike) => {
  var arr = [];
  try {
    arr = [].slice.call(arrayLike);
  } catch (e) {
    // Thanks a lot IE 8. I mean it.
    for (let i = 0; i < arrayLike.length; i++) {
      arr.push(arrayLike[i]);
    }
  }
  return arr;
};
