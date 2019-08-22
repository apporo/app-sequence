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
