'use strict';

var path = require('path');
var contextPath = '/sequence';
var apiPath = 'api';

module.exports = {
  plugins: {
    appRestfront: {
      contextPath: contextPath,
      apiPath: apiPath,
      mappingStore: {
        "example-mappings": path.join(__dirname, '../lib/mappings/all.js')
      }
    },
    appTracelog: {
      tracingPaths: [ path.join(contextPath, apiPath) ],
      tracingBoundaryEnabled: true
    },
    appSequence: {
      counterStateKey: 'dev:sequence-counter',
      sequenceDescriptor: {
        example: {
          expirationPeriod: 'm'
        },
        "abc-xyz": {
          digits: 8,
          expirationPeriod: 'y'
        }
      },
      digits: 4
    },
    appWebserver: {
      port: 17771
    }
  }
};
