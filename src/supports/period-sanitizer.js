'use strict';

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

module.exports = getExpirationPeriod;
