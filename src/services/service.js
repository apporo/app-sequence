'use strict';

var uuid = require('uuid/v4');

function Service (params = {}) {
  var L = params.loggingFactory.getLogger();
  var T = params.loggingFactory.getTracer();
  var express = params.webweaverService.express;

  var pluginCfg = params.sandboxConfig;
  var contextPath = pluginCfg.contextPath || '/sequence';

  this.buildRestRouter = function() {
    var router = express.Router();
    router.route('/generate').get(function(req, res, next) {
      res.json({
        number: uuid(),
        requestId: params.tracelogService.getRequestId(req)
      });
    });
    return router;
  }

  this.getRestRouterLayer = function() {
    return {
      name: 'app-sequence-restapi',
      path: contextPath,
      middleware: this.buildRestRouter()
    };
  }

  if (pluginCfg.autowired !== false) {
    params.webweaverService.push([
      params.webweaverService.getJsonBodyParserLayer([
        params.tracelogService.getTracingBoundaryLayer(),
        params.tracelogService.getTracingListenerLayer(),
        this.getRestRouterLayer()
      ])
    ], pluginCfg.priority);
  }
}

Service.referenceList = [ "tracelogService", "webweaverService" ]

module.exports = Service;
