module.exports = {
  devebot: {
    verbose: true,
    mode: 'silent',
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
  }
};
