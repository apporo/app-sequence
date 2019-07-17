module.exports = {
  plugins: {
    appSequence: {
      contextPath: '/sequence',
      counterRedisKey: 'sequence-counter'
    },
    appTracelog: {
      tracingPaths: [ '/sequence/*' ]
    },
    appWebserver: {
      port: 17771
    }
  }
};
