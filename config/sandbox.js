module.exports = {
  plugins: {
    appSequence: {
      timeout: 5000,
      sequenceGenerator: {
        default: {
          expirationPeriod: 'd'
        }
      },
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
