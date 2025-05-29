// config.js
module.exports = {
  app: {
    name: 'EmailService',
    port: 8079
  },
  eureka: {
    host: 'e8.systeo.tn',
    preferIpAddress: false,
    serviceUrl: 'https://eureka.systeo.tn/eureka/'
  },
  mvc: {
    hiddenMethodFilter: false
  },
  cloudConfig: {
    enabled: false
  }
};