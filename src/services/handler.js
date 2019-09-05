'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const logolite = Devebot.require('logolite');
const genUUID = logolite.LogConfig.getLogID;
const OptionSanitizer = require('../supports/period-sanitizer');
const CodeGenerator = require('../supports/code-generator');
const UniqueCounter = require('../supports/unique-counter');

function Service ({ packageName, sandboxConfig, loggingFactory, errorManager, counterDialect }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();
  const counterStateKey = sandboxConfig.counterStateKey || "sequence-counter";
  const sequenceDescriptor = sandboxConfig.sequenceDescriptor;

  const errorBuilder = errorManager.register(packageName, {
    errorCodes: sandboxConfig.errorCodes
  });

  const timeout = sandboxConfig.timeout && sandboxConfig.timeout > 0 ? sandboxConfig.timeout : 0;

  const sanitizer = new OptionSanitizer({ sequenceDescriptor, generalDigits: sandboxConfig.digits });

  const counter = new UniqueCounter({ L, T, sanitizer, timeout, errorBuilder, counterStateKey, counterDialect })

  const generator = new CodeGenerator({ L, T, sanitizer, counter });

  this.generate = function (opts = { requestId: 'unknown' }) {
    const { requestId, sequenceName } = opts;

    if (sequenceName && !sanitizer.hasSequenceName(sequenceName)) {
      return Bluebird.reject(errorBuilder.newError('SequenceNameNotFound', {
        payload: {
          sequenceName: sequenceName
        }
      }));
    }

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
  errorManager: 'app-errorlist/manager',
  counterDialect: "redis#stateStore"
}

module.exports = Service;
