var base = '/api';

export default {

  'one': {
    'url': `${base}/one`
  },

  'two': {
    'url': `${base}/testing`,
    'data': {
      'defaultKey': 'itWillRemain'
    }
  },

  'combo': [{
    'id': 'one'
  }, {
    'id': 'two',
    'map': {
      'greetings': 'extraData'
    }
  }, {
    'url': `${base}/last`,
    'data': {
      'default': 'stuff'
    },
    'map': {
      'deeply.nested.key': 'extra'
    }
  }],

  'awesome-list-data': {
    'url': `${base}/awesome-list-data`
  }

};
