'use strict';

var path = require('path');
var contextPath = '/sequence';
var apiPath = 'api';
var apiVersion = 'v1';

module.exports = {
  plugins: {
    appRestfront: {
      contextPath: contextPath,
      apiPath: apiPath,
      apiVersion: apiVersion,
      mappingStore: {
        "example-mappings": path.join(__dirname, '../lib/mappings/all.js')
      }
    },
    appTracelog: {
      tracingPaths: [ path.join(contextPath, apiPath, apiVersion) ],
      tracingBoundaryEnabled: true
    },
    appSequence: {
      counterStateKey: 'sequence-counter'
    },
    appWebserver: {
      port: 17771
    }
  }
};
