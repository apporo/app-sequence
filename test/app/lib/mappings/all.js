'use strict';

var mappings = [
  {
    path: '/generate',
    method: 'GET',
    input: {
      transform: function (req) {
        return {}
      },
    },
    serviceName: 'app-sequence/handler',
    methodName: 'generate',
    error: {
      transform: function(err, req) {
        return err;
      },
    },
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
