import { Pretender } from './lib/pretender';
import { serialize } from '../core/utils';
import responses from './responses';

var responseHandler = (k, req) => {
  var res = responses[k];
  if (req.queryParams.fails) {
    return [404, {
        'Content-Type': 'application/json'
      },
      serialize((res.failure && res.failure()) || 'Not found.')
    ];
  } else {
    return [200, {
        'Content-Type': 'application/json'
      },
      serialize((res.success && res.success()) || (res && res()))
    ];
  }
};

window.mockServer = new Pretender(function() {
  Object.keys(responses).forEach(k => {
    this.get(k, responseHandler.bind(this, k));
  });
});


