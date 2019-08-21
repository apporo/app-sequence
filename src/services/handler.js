'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const moment = require('moment');
const UniqueCounter = require('../supports/unique-counter');

function Service ({ sandboxConfig, loggingFactory, counterDialect }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();
  const counterStateKey = sandboxConfig.counterStateKey || "sequence-counter";

  const timeout = sandboxConfig.timeout && sandboxConfig.timeout > 0 ? sandboxConfig.timeout : 0;

  const counter = new UniqueCounter({ L, T, timeout, counterStateKey, counterDialect })

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
