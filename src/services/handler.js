'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const Base36Generator = require('../supports/base36-generator');
const DailyGenerator = require('../supports/daily-generator');
const UniqueCounter = require('../supports/unique-counter');

function Service ({ sandboxConfig, loggingFactory, counterDialect }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();
  const expirationPeriod = sandboxConfig.expirationPeriod;
  const counterStateKey = sandboxConfig.counterStateKey || "sequence-counter";

  const timeout = sandboxConfig.timeout && sandboxConfig.timeout > 0 ? sandboxConfig.timeout : 0;

  const counter = new UniqueCounter({ L, T, timeout, expirationPeriod, counterStateKey, counterDialect })

  let generator;
  switch (expirationPeriod) {
    case 'm':
    case 'month':
    case 'monthly':
      generator = new Base36Generator({ L, T, counter, digits: 6 });
      break;
    default:
      generator = new DailyGenerator({ L, T, counter, digits: 5 });
      break;
  }

  this.generate = function (data, { requestId } = { requestId: 'unknown' }) {
    let p = generator.generate({ requestId });

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
