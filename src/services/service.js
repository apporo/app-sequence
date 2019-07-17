'use strict';

function Service ({ sandboxConfig, loggingFactory, sequenceHandler, tracelogService, webweaverService }) {
  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();
  const contextPath = sandboxConfig.contextPath || '/sequence';
  const express = webweaverService.express;

  this.buildRestRouter = function() {
    const router = express.Router();
    router.route('/generate').get(function(req, res, next) {
      sequenceHandler.generate().then(function (count) {
        res.json({
          number: count,
          requestId: tracelogService.getRequestId(req)
        });
      })
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

  if (sandboxConfig.autowired !== false) {
    webweaverService.push([
      webweaverService.getJsonBodyParserLayer([
        tracelogService.getTracingBoundaryLayer(),
        tracelogService.getTracingListenerLayer(),
        this.getRestRouterLayer()
      ])
    ], sandboxConfig.priority);
  }
}

Service.referenceHash = {
  sequenceHandler: "handler",
  tracelogService: "app-tracelog/tracelogService",
  webweaverService: "app-webweaver/webweaverService"
}

module.exports = Service;
