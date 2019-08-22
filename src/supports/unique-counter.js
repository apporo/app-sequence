'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const moment = require('moment');

function UniqueCounter (params = {}) {
  const { L, T, sanitizer, timeout, counterStateKey, counterDialect, errorBuilder } = params;

  let counterClient = null;
  let counterEnabled = true;

  function getCounter () {
    if (!counterClient) {
      counterClient = counterDialect.open();
      counterClient.on("ready", function () {
        counterEnabled = true;
        L.has('info') && L.log('info', T.toMessage({
          text: 'Redis connection is ready'
        }));
      });
      counterClient.on("error", function (err) {
        counterEnabled = false;
        L.has('warn') && L.log('warn', T.add({
          errName: err.name, errMessage: err.message
        }).toMessage({
          text: 'Redis connection is breaking down'
        }));
      });
    }
    return counterClient;
  }

  let renewCommand = false;

  let _IncrCommand = null;
  function getIncrCommand () {
    if (_IncrCommand == null || renewCommand) {
      const counterClient = getCounter();
      _IncrCommand = Bluebird.promisify(counterClient.incr, { context: counterClient });
    }
    return _IncrCommand;
  }

  let _ExpireAtCommand = null;
  function getExpireAtCommand () {
    if (_ExpireAtCommand == null || renewCommand) {
      const counterClient = getCounter();
      _ExpireAtCommand = Bluebird.promisify(counterClient.expireat, { context: counterClient });
    }
    return _ExpireAtCommand;
  }

  let _TtlCommand = null;
  function getTtlCommand () {
    if (_TtlCommand == null || renewCommand) {
      const counterClient = getCounter();
      _TtlCommand = Bluebird.promisify(counterClient.ttl, { context: counterClient });
    }
    return _TtlCommand;
  }

  this.next = function({ requestId, sequenceName, expirationPeriod } = {}) {
    if (sanitizer) {
      sequenceName = sanitizer.getSequenceName(sequenceName);
      expirationPeriod = sanitizer.getExpirationPeriod(sequenceName, expirationPeriod);
    }

    const counterName = [ counterStateKey, sequenceName, expirationPeriod ].join(':');

    const now = moment.utc();
    L.has('info') && L.log('info', T.add({ requestId, now }).toMessage({
      tmpl: 'Req[${requestId}] Generate a new ID at ${now}'
    }));

    let p = Bluebird.resolve();

    if (timeout > 0) {
      p = p.timeout(timeout);
    }

    if (counterEnabled === false) {
      p = Bluebird.reject(errorBuilder.newError('RedisConnectionLost'));
    }

    p = p.then(function() {
      return getTtlCommand()(counterName).then(function(val) {
        L.has('silly') && L.log('silly', T.add({ requestId, counterName, ttl: val }).toMessage({
          tmpl: 'Req[${requestId}] TTL of [${counterName}]: ${ttl}'
        }));
        if (val <= -1) {
          const tomorrow = nextExpiredTime(now, expirationPeriod);
          const unixtime = tomorrow.valueOf() / 1000;
          L.has('silly') && L.log('silly', T.add({ requestId, counterName, tomorrow, unixtime }).toMessage({
            tmpl: 'Req[${requestId}] Set a new expire for [${counterName}] at: ${tomorrow}, in unixtime: ${unixtime}'
          }));
          return getExpireAtCommand()(counterName, unixtime); // 0 or 1
        }
        return -1;
      })
    });

    p = p.then(function (val) {
      return getIncrCommand()(counterName);
    });

    p = p.then(function (number) {
      return { now, number };
    })

    return p;
  }
}

function nextExpiredTime(now, expirationPeriod) {
  // clone the [now] object
  now = moment.utc(now);
  switch (expirationPeriod) {
    case 'd':
      return now.add(1, 'days').hour(0).minute(0).second(0).millisecond(0);
    case 'm':
      return now.add(1, 'months').date(1).hour(0).minute(0).second(0).millisecond(0);
    case 'y':
      return now.add(1, 'years').month(0).date(1).hour(0).minute(0).second(0).millisecond(0);
  }
  throw new Error('Invalid expirationPeriod');
}

module.exports = UniqueCounter;
