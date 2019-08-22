module.exports = {
  plugins: {
    appSequence: {
      timeout: 5000,
      sequenceDescriptor: {
        default: {
          expirationPeriod: 'd'
        }
      },
      errorCodes: {
        SequenceNameNotFound: {
          message: 'Sequence generator not found',
          returnCode: 5001,
          statusCode: 400
        },
        RedisConnectionLost: {
          message: 'Lost Connection to Redis Server',
          returnCode: 5002,
          statusCode: 500
        },
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
