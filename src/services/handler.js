'use strict';

const Devebot = require('devebot');
const Bluebird = Devebot.require('bluebird');
const uuid = require('uuid/v4');

function Service ({ sandboxConfig, loggingFactory, counterClient }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();

  let counter = null;
  function getCounter () {
    return counter = counter || counterClient.open();
  }

  let incrCommand = null;
  function getIncrCommand () {
    if (incrCommand == null) {
      const counter = getCounter();
      incrCommand = Bluebird.promisify(counter.incr, { context: counter });
    }
    return incrCommand;
  }

  this.generate = function () {
    return getIncrCommand()("sequence-counter");
  }
}

Service.referenceHash = {
  counterClient: "redis#stateStore"
}

module.exports = Service;
