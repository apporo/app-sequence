'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const moment = require('moment');

function RedisCounter ({ L, T, timeout, counterStateKey, counterDialect }) {
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
          const tomorrow = now.add(1, 'd').hour(0).minute(0).second(0).millisecond(0);
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

function Service ({ sandboxConfig, loggingFactory, counterDialect }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();
  const counterStateKey = sandboxConfig.counterStateKey || "sequence-counter";

  const timeout = sandboxConfig.timeout && sandboxConfig.timeout > 0 ? sandboxConfig.timeout : 0;

  const counter = new RedisCounter({ L, T, timeout, counterStateKey, counterDialect })

  this.generate = function (data, { requestId } = { requestId: 'unknown' }) {
    let p = counter.next({ requestId });

    p = p.then(function (incr) {
      L.has('info') && L.log('info', T.add({ requestId, incr }).toMessage({
        tmpl: 'Req[${requestId}] Generate the ID from increased count value [${incr}]'
      }));
      return generateID(incr);
    });

    p = p.catch(function (err) {
      if (sandboxConfig.breakOnError) {
        L.has('info') && L.log('info', T.add({ requestId }).toMessage({
          tmpl: 'Req[${requestId}] generate() function has failed, break the processing'
        }));
        return Bluebird.reject(err);
      } else {
        const tempId = genUUID();
        L.has('info') && L.log('info', T.add({ requestId, tempId }).toMessage({
          tmpl: 'Req[${requestId}] generate() function has failed, use a UUID [${tempId}] instead'
        }));
        return Bluebird.resolve(tempId);
      }
    });

    return p;
  }
}

Service.referenceHash = {
  counterDialect: "redis#stateStore"
}

module.exports = Service;

function generateID (incr, now) {
  return getDate(now) + '-' + lodash.padStart(incr, 5, '0');
}

function getDate (now, formatType) {
  now = moment.utc(now);
  let dd = now.date();
  let mm = now.month();
  let yyyy = now.year();
  // if (formatType === 'DAY_OF_YEAR') {
  //   let dayOfYear = now.dayOfYear();
  // }
  return yyyy + '-' + letterOf(mm) + letterOf(dd-1);
}

function letterOf(number) {
  if (number < 10) return number;
  return String.fromCharCode('A'.charCodeAt(0) + (number - 10));
}
