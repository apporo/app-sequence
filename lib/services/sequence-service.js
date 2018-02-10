'use strict';

var uuid = require('uuid/v4');

var Service = function(params) {
  params = params || {};
  var self = this;

  var LX = params.loggingFactory.getLogger();
  var LT = params.loggingFactory.getTracer();
  var express = params.webweaverService.express;

  var pluginCfg = params.sandboxConfig;
  var contextPath = pluginCfg.contextPath || '/sequence';

  self.buildRestRouter = function() {
    var router = express.Router();
    router.route('/generate').get(function(req, res, next) {
      res.json({
        number: uuid(),
        requestId: params.tracelogService.getRequestId(req)
      });
    });
    return router;
  }

  self.getRestRouterLayer = function() {
    return {
      name: 'app-sequence-rest',
      path: contextPath,
      middleware: self.buildRestRouter()
    };
  }

  if (pluginCfg.autowired !== false) {
    params.webweaverService.push([
      params.webweaverService.getJsonBodyParserLayer([
        params.tracelogService.getTracingBoundaryLayer(),
        params.tracelogService.getTracingListenerLayer(),
        self.getRestRouterLayer()
      ])
    ], pluginCfg.priority);
  }
}

Service.referenceList = [ "tracelogService", "webweaverService" ]

module.exports = Service;
