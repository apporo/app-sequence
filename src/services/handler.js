'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const IdGenerator = require('../supports/id-generator');
const UniqueCounter = require('../supports/unique-counter');

function Service ({ sandboxConfig, loggingFactory, counterDialect }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();
  const expirationPeriod = sandboxConfig.expirationPeriod;
  const counterStateKey = sandboxConfig.counterStateKey || "sequence-counter";

  const timeout = sandboxConfig.timeout && sandboxConfig.timeout > 0 ? sandboxConfig.timeout : 0;

  const counter = new UniqueCounter({ L, T, timeout, expirationPeriod, counterStateKey, counterDialect })

  const generator = new IdGenerator({ L, T, counter, digits: 5, expirationPeriod });

  this.generate = function (opts = { requestId: 'unknown' }) {
    const { requestId } = opts;
    let p = generator.generate(opts);

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
