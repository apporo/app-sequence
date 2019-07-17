'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const moment = require('moment');

function Service ({ sandboxConfig, loggingFactory, counterClient }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();

  const counterStateKey = "sequence-counter";

  let counter = null;
  function getCounter () {
    return counter = counter || counterClient.open();
  }

  let _IncrCommand = null;
  function getIncrCommand () {
    if (_IncrCommand == null) {
      const counter = getCounter();
      _IncrCommand = Bluebird.promisify(counter.incr, { context: counter });
    }
    return _IncrCommand;
  }

  let _ExpireAtCommand = null;
  function getExpireAtCommand () {
    if (_ExpireAtCommand == null) {
      const counter = getCounter();
      _ExpireAtCommand = Bluebird.promisify(counter.expireat, { context: counter });
    }
    return _ExpireAtCommand;
  }

  let _TtlCommand = null;
  function getTtlCommand () {
    if (_TtlCommand == null) {
      const counter = getCounter();
      _TtlCommand = Bluebird.promisify(counter.ttl, { context: counter });
    }
    return _TtlCommand;
  }

  this.generate = function () {
    const now = moment.utc();
    return Promise.resolve()
    .then(function() {
      return getTtlCommand()(counterStateKey).then(function(val) {
        if (val <= -1) {
          const tomorrow = now.add(1, 'd').hour(0).minute(0).second(0).millisecond(1);
          return getExpireAtCommand()(counterStateKey, tomorrow.valueOf()); // 0 or 1
        }
        return -1;
      })
    })
    .then(function(val) {
      return getIncrCommand()(counterStateKey);
    })
    .then(generateID);
  }
}

Service.referenceHash = {
  counterClient: "redis#stateStore"
}

module.exports = Service;

function generateID (incr, now) {
  return getDate(now) + '-' + lodash.padStart(incr, 5, '0');
}

function getDate (now, formatType) {
  now = moment.utc(now);
  let dayOfYear = now.dayOfYear();
  let dd = now.date();
  let mm = now.month();
  let yyyy = now.year();
  if (formatType === 'DAY_OF_YEAR') {

  }
  return yyyy + '-' + letterOf(mm) + letterOf(dd-1);
}

function letterOf(number) {
  if (number < 10) return number;
  return String.fromCharCode('A'.charCodeAt(0) + (number - 10));
}
