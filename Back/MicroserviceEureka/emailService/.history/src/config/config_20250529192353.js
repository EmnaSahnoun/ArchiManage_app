const Eureka = require('eureka-js-client').Eureka;
const config = require('./config');
const eurekaClient = new Eureka({
  instance: {
    app: config.server.name,
    hostName: config.server.host,
    ipAddr: '127.0.0.1',
    statusPageUrl: `http://${config.server.host}:${config.server.port}/info`,
    healthCheckUrl: `http://${config.server.host}:${config.server.port}/health`,
    port: {
      '$': config.server.port,
      '@enabled': 'true',
    },
    vipAddress: config.server.name,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: config.eureka.host,
    port: config.eureka.port,
    servicePath: config.eureka.servicePath,
    heartbeatInterval: config.eureka.heartbeatInterval,
    registryFetchInterval: config.eureka.registryFetchInterval,
    maxRetries: config.eureka.maxRetries,
  },
});

module.exports = eurekaClient;