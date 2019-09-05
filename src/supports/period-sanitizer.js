'use strict';

const assert = require('assert');
const Devebot = require('devebot');
const lodash = Devebot.require('lodash');

const DEFAULT_DIGITS = 5;

function OptionSanitizer ({ sequenceDescriptor, generalDigits }) {
  sequenceDescriptor = sequenceDescriptor || {};
  assert.ok(lodash.isObject(sequenceDescriptor), 'sequenceDescriptor must be a object');

  for (const sequenceName in sequenceDescriptor) {
    sequenceDescriptor[sequenceName] = sequenceDescriptor[sequenceName] || {};
    sequenceDescriptor[sequenceName].expirationPeriod = 
        sanitizeExpiresPeriod(sequenceDescriptor[sequenceName].expirationPeriod) || 'd';
    sequenceDescriptor[sequenceName].digits = sequenceDescriptor[sequenceName].digits ||
        generalDigits || DEFAULT_DIGITS;
    assert.ok(sequenceDescriptor[sequenceName].digits >= 2, 'digits must be at least 2 digits');
    assert.ok(sequenceDescriptor[sequenceName].digits <= 9, 'digits must be at most 9 digits');
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

  this.getDigits = function (sequenceName) {
    if (sequenceName in sequenceDescriptor) {
      return sequenceDescriptor[sequenceName].digits;
    }
    return DEFAULT_DIGITS;
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
