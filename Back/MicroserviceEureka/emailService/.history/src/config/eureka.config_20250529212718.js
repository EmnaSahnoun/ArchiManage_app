const eurekaClient = new Eureka({
  instance: {
    app: process.env.APP_NAME,
    instanceId: `${process.env.APP_NAME}:${process.env.PORT}`,
    hostName: process.env.EUREKA_INSTANCE_HOSTNAME,
    ipAddr: process.env.EUREKA_INSTANCE_HOSTNAME,
    statusPageUrl: `https://${process.env.EUREKA_INSTANCE_HOSTNAME}:${process.env.PORT}/info`,
    healthCheckUrl: `https://${process.env.EUREKA_INSTANCE_HOSTNAME}:${process.env.PORT}/health`,
    securePort: 443,  // Explicit HTTPS port
    securePortEnabled: true,  // Enable HTTPS
    port: {
      '$': parseInt(process.env.PORT),
      '@enabled': false  // Disable HTTP port
    },
    vipAddress: process.env.APP_NAME,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn'
    }
  },
  eureka: {
    host: 'eureka.systeo.tn',
    port: 443,  // HTTPS port
    servicePath: '/eureka/apps/',
    maxRetries: 10,
    requestRetryDelay: 2000,
    fetchRegistry: true,
    heartbeatInterval: 30000,
    https: true  // Force HTTPS requests
  }
});