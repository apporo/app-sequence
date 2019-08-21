'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const bases = require('bases');
const moment = require('moment');

function Base36Generator(kwargs = {}) {
  const { counter, digits } = kwargs;

  assert.ok(counter && lodash.isObject(counter), 'counter must be a object');
  assert.ok(lodash.isFunction(counter.next), 'counter.next must be a function');
  assert.ok(digits >= 2, 'digits must be at least 2 digits');
  assert.ok(digits <= 10, 'digits must be at most 10 digits');

  const max = Math.pow(36, digits);

  this.generate = function() {
    return Bluebird.resolve(counter.next())
    .then(function(number) {
      if (number >= max) {
        return genUUID();
      }
      const value = bases.toBase36(number);
      return getYear() + '-' + lodash.padStart(value, digits, '0');
    });
  }
}

function getYear (now) {
  now = moment.utc(now);
  return now.year();
}

module.exports = Base36Generator;
