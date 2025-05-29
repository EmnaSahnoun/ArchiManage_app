module.exports = {
  server: {
    port: process.env.PORT || 3000,
    name: 'mon-microservice',
    host: 'localhost'
  },
  eureka: {
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/',
    heartbeatInterval: 30000,
    registryFetchInterval: 30000,
    maxRetries: 3
  }
};