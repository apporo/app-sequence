module.exports = {
  plugins: {
    appSequence: {
      contextPath: '/sequence',
      counterStateKey: 'sequence-counter'
    },
    appTracelog: {
      tracingPaths: [ '/sequence/*' ]
    },
    appWebserver: {
      port: 17771
    }
  }
};
