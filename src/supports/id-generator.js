'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const bases = require('bases');
const moment = require('moment');
const getExpirationPeriod = require('./period-sanitizer');

function IdGenerator(kwargs = {}) {
  const { L, T, counter, digits, expirationPeriod } = kwargs;

  assert.ok(counter && lodash.isObject(counter), 'counter must be a object');
  assert.ok(lodash.isFunction(counter.next), 'counter.next must be a function');
  assert.ok(digits >= 2, 'digits must be at least 2 digits');
  assert.ok(digits <= 9, 'digits must be at most 9 digits');

  const defaultExpiresPeriod = expirationPeriod;

  const maxOf = {
    d: Math.pow(10, digits),
    m: Math.pow(36, digits),
    y: Math.pow(36, (digits + 1))
  }

  this.generate = function(opts) {
    let { requestId, expirationPeriod } = opts;

    expirationPeriod = getExpirationPeriod(expirationPeriod, defaultExpiresPeriod);

    return Bluebird.resolve(counter.next(opts))
    .then(function(number) {
      if (number >= maxOf[expirationPeriod]) {
        return genUUID();
      }
      L.has('info') && L.log('info', T.add({ requestId, number, expirationPeriod }).toMessage({
        tmpl: 'Req[${requestId}] Generate the ID from auto increament number [${number}]'
      }));
      return generate(expirationPeriod, number, digits);
    });
  }
}

function generate (expirationPeriod, number, digits) {
  switch (expirationPeriod) {
    case 'y': {
      const value = bases.toBase36(number);
      return getYear() + '-' + lodash.padStart(value, (digits + 1), '0');
    }
    case 'm': {
      const value = bases.toBase36(number);
      return getMonth() + '-' + lodash.padStart(value, digits, '0');
    }
    case 'd': {
      return getDate() + '-' + lodash.padStart(number, digits, '0');
    }
  }
  throw new Error('Invalid expirationPeriod');
}

function getDate (now) {
  now = moment.utc(now);
  return now.year() + '-' + letterOf(now.month()) + letterOf(now.date() - 1);
}

function getMonth (now) {
  now = moment.utc(now);
  return now.year() + '-' + letterOf(now.month());
}

function getYear (now) {
  now = moment.utc(now);
  return now.year();
}

function letterOf(number) {
  if (number < 10) return number;
  return String.fromCharCode('A'.charCodeAt(0) + (number - 10));
}

module.exports = IdGenerator;
