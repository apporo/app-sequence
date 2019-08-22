'use strict';

var devebot = require('devebot');
var Bluebird = devebot.require('bluebird');
var lodash = devebot.require('lodash');
var assert = require('liberica').assert;
var dtk = require('liberica').mockit;
var sinon = require('liberica').sinon;

describe('supports', function() {
  describe('CodeGenerator', function() {
    var loggingFactory = dtk.createLoggingFactoryMock({ captureMethodCall: false });
    var ctx = {
      L: loggingFactory.getLogger(),
      T: loggingFactory.getTracer(),
      blockRef: 'app-restfront',
    }

    var OptionSanitizer = dtk.acquire('period-sanitizer', { moduleType: 'supports' });
    var CodeGenerator = dtk.acquire('code-generator', { moduleType: 'supports' });

    beforeEach(function() {
    });

    it('generate the base36 unique sequence code properly', function() {
      const next = sinon.stub();
      next.onCall(0).returns({ number: 36 });
      next.onCall(1).returns({ number: Math.pow(36, 5) - 1024 });
      next.onCall(2).returns({ number: Math.pow(36, 6) - 256 });
      const sanitizer = new OptionSanitizer({
        sequenceGenerator: {
          "abc-xyz": {
            expirationPeriod: 'y'
          }
        }
      });
      const generator = new CodeGenerator(lodash.assign(ctx, {
        sanitizer,
        counter: { next },
        digits: 6
      }));
      const promises = Bluebird.map(lodash.range(3), function(count) {
        return generator.generate({ sequenceName: "abc-xyz" });
      })
      return promises.then(function(results) {
        assert.sameMembers(results, ["2019-0000010","2019-00zzz7k","2019-0zzzzsw"]);
      })
    });
  });
});
