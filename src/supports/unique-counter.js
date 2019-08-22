'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const moment = require('moment');

function UniqueCounter ({ L, T, timeout, expirationPeriod, counterStateKey, counterDialect }) {
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

  this.next = function({ requestId } = {}) {
    const now = moment.utc();
    L.has('info') && L.log('info', T.add({ requestId, now }).toMessage({
      tmpl: 'Req[${requestId}] Generate a new ID at ${now}'
    }));

    let p = Bluebird.resolve();

    if (timeout > 0) {
      p = p.timeout(timeout);
    }

    if (counterEnabled === false) {
      p = Bluebird.reject();
    }

    p = p.then(function() {
      return getTtlCommand()(counterStateKey).then(function(val) {
        L.has('silly') && L.log('silly', T.add({ requestId, counterStateKey, ttl: val }).toMessage({
          tmpl: 'Req[${requestId}] TTL of ${counterStateKey}: ${ttl}'
        }));
        if (val <= -1) {
          const tomorrow = nextExpiredTime(now, { expirationPeriod });
          const unixtime = tomorrow.valueOf() / 1000;
          L.has('silly') && L.log('silly', T.add({ requestId, tomorrow, unixtime }).toMessage({
            tmpl: 'Req[${requestId}] Set a new expire for ${counterStateKey} at: ${tomorrow}, in unixtime: ${unixtime}'
          }));
          return getExpireAtCommand()(counterStateKey, unixtime); // 0 or 1
        }
        return -1;
      })
    });

    p = p.then(function (val) {
      return getIncrCommand()(counterStateKey);
    });

    return p;
  }
}

function nextExpiredTime(now, { expirationPeriod } = {}) {
  switch (expirationPeriod) {
    case 'm':
    case 'month':
    case 'monthly':
      return now.add(1, 'm').day(0).hour(0).minute(0).second(0).millisecond(0);
  }
  return now.add(1, 'd').hour(0).minute(0).second(0).millisecond(0);
}

module.exports = UniqueCounter;
