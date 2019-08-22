'use strict';

var mappings = [
  {
    path: '/generate',
    method: 'GET',
    input: {
      transform: function (req) {
        return {
          requestId: req.get('X-Request-Id'),
          expirationPeriod: req.get('X-Expiration-Period')
        }
      },
    },
    serviceName: 'app-sequence/handler',
    methodName: 'generate',
    output: {
      transform: function(result, req) {
        return {
          body: {
            number: result
          }
        };
      },
    }
  }
]

module.exports = mappings;
