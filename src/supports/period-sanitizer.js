'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const lodash = Devebot.require('lodash');

function OptionSanitizer ({ sequenceGenerator }) {
  sequenceGenerator = sequenceGenerator || {};
  assert.ok(lodash.isObject(sequenceGenerator), 'sequenceGenerator must be a object');

  for (const sequenceName in sequenceGenerator) {
    sequenceGenerator[sequenceName] = sequenceGenerator[sequenceName] || {};
    sequenceGenerator[sequenceName].expirationPeriod = 
        sanitizeExpiresPeriod(sequenceGenerator[sequenceName].expirationPeriod) || 'd';
  }

  this.getSequenceName = function (sequenceName) {
    if (sequenceName in sequenceGenerator) {
      return sequenceName;
    }
    return 'default';
  }

  this.getExpirationPeriod = function (sequenceName, expirationPeriod) {
    sequenceName = this.getSequenceName(sequenceName);
    return sanitizeExpiresPeriod (expirationPeriod) ||
        sequenceGenerator[sequenceName].expirationPeriod || 'd';
  }
}

function sanitizeExpiresPeriod (expirationPeriod) {
  switch (expirationPeriod) {
    case 'y':
    case 'm':
    case 'd': {
      return expirationPeriod;
    }
    case 'day': {
      return 'd';
    }
    case 'month': {
      return 'm';
    }
    case 'year': {
      return 'y';
    }
  }
  return null;
}

module.exports = OptionSanitizer;
