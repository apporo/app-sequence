'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const bases = require('bases');
const moment = require('moment');

function CodeGenerator(kwargs = {}) {
  const { L, T, sanitizer, counter } = kwargs;

  assert.ok(counter && lodash.isObject(counter), 'counter must be a object');
  assert.ok(lodash.isFunction(counter.next), 'counter.next must be a function');

  const maxOf = [];

  this.generate = function(opts) {
    let { requestId, sequenceName, expirationPeriod } = opts;

    sequenceName = sanitizer.getSequenceName(sequenceName);
    expirationPeriod = sanitizer.getExpirationPeriod(sequenceName, expirationPeriod);

    opts = { requestId, sequenceName, expirationPeriod };

    const digits = sanitizer.getDigits(sequenceName);

    maxOf[digits] = maxOf[digits] || {
      d: Math.pow(10, digits),
      m: Math.pow(36, digits),
      y: Math.pow(36, (digits + 1))
    }

    L.has('info') && L.log('info', T.add(opts).toMessage({
      tmpl: 'Req[${requestId}] Generate the ID[${sequenceName}] with period [${expirationPeriod}]'
    }));

    return Bluebird.resolve(counter.next(opts))
    .then(function(result = {}) {
      const { now, number } = result;
      if (number >= maxOf[digits][expirationPeriod]) {
        return genUUID();
      }
      L.has('info') && L.log('info', T.add({ requestId, number }).toMessage({
        tmpl: 'Req[${requestId}] Generate the ID from auto increament number [${number}]'
      }));
      return generate(expirationPeriod, number, digits, now);
    });
  }
}

function generate (expirationPeriod, number, digits, now) {
  switch (expirationPeriod) {
    case 'y': {
      const value = bases.toBase36(number);
      return getYear(now) + '-' + lodash.padStart(value, (digits + 1), '0');
    }
    case 'm': {
      const value = bases.toBase36(number);
      return getMonth(now) + '-' + lodash.padStart(value, digits, '0');
    }
    case 'd': {
      return getDate(now) + '-' + lodash.padStart(number, digits, '0');
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

module.exports = CodeGenerator;
