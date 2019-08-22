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
      sequenceGenerator: {
        example: {
          expirationPeriod: 'm'
        },
        "abc-xyz": {
          expirationPeriod: 'y'
        }
      },
    },
    appWebserver: {
      port: 17771
    }
  }
};
