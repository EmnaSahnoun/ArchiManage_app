const Eureka = require('eureka-js-client').Eureka;

module.exports = new Eureka({
  instance: {
    app: process.env.APP_NAME,
    instanceId: `${process.env.APP_NAME}:${process.env.PORT}`,
    hostName: process.env.EUREKA_INSTANCE_HOSTNAME,
    ipAddr: '127.0.0.1',
    statusPageUrl: `http://${process.env.EUREKA_INSTANCE_HOSTNAME}:${process.env.PORT}/info`,
    healthCheckUrl: `http://${process.env.EUREKA_INSTANCE_HOSTNAME}:${process.env.PORT}/health`,
    port: {
      '$': parseInt(process.env.PORT),
      '@enabled': true
    },
    vipAddress: process.env.APP_NAME,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn'
    },
    registerWithEureka: true,
    preferIpAddress: process.env.EUREKA_PREFER_IP_ADDRESS === 'true'
  },
  eureka: {
    host: new URL(process.env.EUREKA_SERVICE_URL).hostname,
    port: 443,
    servicePath: '/eureka/apps/',
    maxRetries: 10,
    requestRetryDelay: 2000
  }
});