'use strict';

var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');

var commandConfig;

var commandObject = {
  info: {
    alias: 'sequence-list',
    description: 'Display sequence descriptors',
    options: []
  },
  handler: function(options, payload, ctx) {
    var LX = this.loggingFactory.getLogger();
    var LT = this.loggingFactory.getTracer();

    LX.has('conlog') && LX.log('conlog', 'seq-list is invoked with: %s', JSON.stringify(options));
    return Promise.resolve([{
        type: 'json',
        title: 'Sequence descriptors',
        data: []
    }]);
  }
};

module.exports = function(params) {
  commandConfig = params || {};
  return commandObject;
};
