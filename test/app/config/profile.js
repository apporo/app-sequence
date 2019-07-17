module.exports = {
  devebot: {
    verbose: true,
    mode: 'command',
    jobqueue: {
      enabled: false
    }
  },
  logger: {
    transports: {
      console: {
        type: 'console',
        level: 'debug',
        json: false,
        timestamp: true,
        colorize: true
      }
    }
  },
  newFeatures: {
    application: {
      sandboxConfig: true
    }
  }
};
