module.exports = {
  plugins: {
    appSequence: {
      contextPath: '/sequence'
    },
    appTracelog: {
      tracingPaths: [ '/sequence/*' ]
    },
    appWebserver: {
      port: 17771
    }
  }
};
