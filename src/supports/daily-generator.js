'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const moment = require('moment');

function Generator(kwargs = {}) {
  const { L, T, counter, digits } = kwargs;

  assert.ok(counter && lodash.isObject(counter), 'counter must be a object');
  assert.ok(lodash.isFunction(counter.next), 'counter.next must be a function');
  assert.ok(digits >= 2, 'digits must be at least 2 digits');
  assert.ok(digits <= 10, 'digits must be at most 10 digits');

  const max = Math.pow(10, digits);

  this.generate = function(opts) {
    const { requestId } = opts;
    return Bluebird.resolve(counter.next(opts))
    .then(function(number) {
      if (number >= max) {
        return genUUID();
      }
      L.has('info') && L.log('info', T.add({ requestId, number }).toMessage({
        tmpl: 'Req[${requestId}] Generate the ID from increased count value [${number}]'
      }));
      return getDate() + '-' + lodash.padStart(number, digits, '0');;
    });
  }
}

function getDate (now, formatType) {
  now = moment.utc(now);
  let dd = now.date();
  let mm = now.month();
  let yyyy = now.year();
  // if (formatType === 'DAY_OF_YEAR') {
  //   let dayOfYear = now.dayOfYear();
  // }
  return yyyy + '-' + letterOf(mm) + letterOf(dd-1);
}

function letterOf(number) {
  if (number < 10) return number;
  return String.fromCharCode('A'.charCodeAt(0) + (number - 10));
}

module.exports = Generator;
