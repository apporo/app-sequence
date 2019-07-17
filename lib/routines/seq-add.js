'use strict';

var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');

var commandConfig;

var commandObject = {
  info: {
    alias: 'seq-create',
    description: 'Create a new sequence',
    options: [
      {
        abbr: 'm',
        name: 'min',
        description: 'The lowest value (left bound)',
        required: false
      },
      {
        abbr: 'x',
        name: 'max',
        description: 'The highest value (right bound)',
        required: false
      }
    ]
  },
  handler: function(options, payload, ctx) {
    var LX = this.loggingFactory.getLogger();
    var LT = this.loggingFactory.getTracer();

    LX.has('conlog') && LX.log('conlog', 'seq-list is invoked with: %s', JSON.stringify(options));
    return Promise.resolve([{
        type: 'json',
        title: 'Sequence descriptors',
        data: options
    }]);
  }
};

module.exports = function(params) {
  commandConfig = params || {};
  return commandObject;
};
