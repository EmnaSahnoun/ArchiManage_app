const Eureka = require('eureka-js-client').Eureka;

module.exports = new Eureka({
  instance: {
    app: process.env.APP_NAME,
    instanceId: `${process.env.APP_NAME}:${process.env.PORT}`,
    hostName: process.env.EUREKA_INSTANCE_HOSTNAME,
    ipAddr: process.env.EUREKA_INSTANCE_HOSTNAME, // Important: utiliser le même hostname
    statusPageUrl: `https://${process.env.EUREKA_INSTANCE_HOSTNAME}:${process.env.PORT}/info`,
    healthCheckUrl: `https://${process.env.EUREKA_INSTANCE_HOSTNAME}:${process.env.PORT}/health`,
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
    preferIpAddress: false // Doit correspondre à la config Spring Boot
  },
  eureka: {
    host: 'eureka.systeo.tn', // Le hostname seulement
    port: 443, // HTTPS standard
    servicePath: '/eureka/apps/', // Chemin spécifique
    maxRetries: 10,
    requestRetryDelay: 2000,
    fetchRegistry: true,
    heartbeatInterval: 30000
  }
});