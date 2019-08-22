module.exports = {
  plugins: {
    appSequence: {
      expirationPeriod: 'month',
      timeout: 5000
    }
  },
  bridges: {
    redis: {
      appSequence: {
        stateStore: {
          clientOptions: {
            host: "localhost",
            port: 6379
          }
        }
      }
    }
  }
};
