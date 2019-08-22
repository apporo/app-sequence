'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const lodash = Devebot.require('lodash');

function OptionSanitizer ({ sequenceDescriptor }) {
  sequenceDescriptor = sequenceDescriptor || {};
  assert.ok(lodash.isObject(sequenceDescriptor), 'sequenceDescriptor must be a object');

  for (const sequenceName in sequenceDescriptor) {
    sequenceDescriptor[sequenceName] = sequenceDescriptor[sequenceName] || {};
    sequenceDescriptor[sequenceName].expirationPeriod = 
        sanitizeExpiresPeriod(sequenceDescriptor[sequenceName].expirationPeriod) || 'd';
  }

  this.hasSequenceName = function (sequenceName) {
    return (sequenceName in sequenceDescriptor);
  }

  this.getSequenceName = function (sequenceName) {
    if (sequenceName in sequenceDescriptor) {
      return sequenceName;
    }
    return 'default';
  }

  this.getExpirationPeriod = function (sequenceName, expirationPeriod) {
    sequenceName = this.getSequenceName(sequenceName);
    return sanitizeExpiresPeriod (expirationPeriod) ||
        sequenceDescriptor[sequenceName].expirationPeriod || 'd';
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
