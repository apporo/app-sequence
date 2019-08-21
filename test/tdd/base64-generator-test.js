'use strict';

var devebot = require('devebot');
var Bluebird = devebot.require('bluebird');
var lodash = devebot.require('lodash');
var assert = require('liberica').assert;
var dtk = require('liberica').mockit;
var sinon = require('liberica').sinon;

describe('supports', function() {
  describe('Base36Generator', function() {
    var loggingFactory = dtk.createLoggingFactoryMock({ captureMethodCall: false });
    var ctx = {
      L: loggingFactory.getLogger(),
      T: loggingFactory.getTracer(),
      blockRef: 'app-restfront',
    }

    var Base36Generator;

    beforeEach(function() {
      Base36Generator = dtk.acquire('base36-generator', { moduleType: 'supports' });
    });

    it('generate the base36 unique sequence code properly', function() {
      const next = sinon.stub();
      next.onCall(0).returns(36);
      next.onCall(1).returns(Math.pow(36, 5) - 1024);
      next.onCall(2).returns(Math.pow(36, 6) - 256);
      const generator = new Base36Generator({
        counter: { next },
        digits: 7
      });
      const promises = Bluebird.map(lodash.range(3), function(count) {
        return generator.generate();
      })
      return promises.then(function(results) {
        assert.sameMembers(results, ["2019-0000010","2019-00zzz7k","2019-0zzzzsw"]);
      })
    });
  });
});
