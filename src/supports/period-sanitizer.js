'use strict';

const Devebot = require('devebot');
const lodash = Devebot.require('lodash');

function OptionSanitizer ({ sequenceNames, expirationPeriod }) {
  const d_sequenceNames = [];
  if (lodash.isArray(sequenceNames)) {
    Array.prototype.push.apply(d_sequenceNames, sequenceNames);
  }

  const d_expirationPeriod = sanitizeExpiresPeriod(expirationPeriod);

  this.getSequenceName = function (sequenceName) {
    if (d_sequenceNames.indexOf(sequenceName) >= 0) {
      return sequenceName;
    }
    return 'default';
  }

  this.getExpirationPeriod = function (expirationPeriod) {
    return sanitizeExpiresPeriod (expirationPeriod) ||
        sanitizeExpiresPeriod(d_expirationPeriod) || 'd';
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

function getExpirationPeriod (expirationPeriod, defaultExpiresPeriod) {
  return sanitizeExpiresPeriod (expirationPeriod) ||
      sanitizeExpiresPeriod(defaultExpiresPeriod) || 'd';
}

module.exports = OptionSanitizer;
