require('dotenv').config();

module.exports = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchange: process.env.RABBITMQ_EXCHANGE || 'exchange.NotificationService.sendEmail',
    queue: process.env.RABBITMQ_QUEUE || 'queue.EmailService.sendEmail',
    routingKey: process.env.RABBITMQ_ROUTING_KEY || 'NotificationService.envoye.EmailService'
  }
};