'use strict';

var mappings = [
  {
    path: [ '/generate', '/generate/:sequenceName' ],
    method: 'GET',
    input: {
      transform: function (req) {
        return {
          requestId: req.get('X-Request-Id'),
          expirationPeriod: req.get('X-Expiration-Period'),
          sequenceName: req.params.sequenceName
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
