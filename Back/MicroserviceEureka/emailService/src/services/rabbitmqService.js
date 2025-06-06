const amqp = require('amqplib');
const config = require('../rabbitmq.config');
const gmailService = require('./gmailService');
const logger = require('../utils/logger');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(
        config.rabbitmq.exchange,
        'topic',
        { durable: true }
      );

      await this.channel.assertQueue(
        config.rabbitmq.queue,
        { durable: true }
      );

      await this.channel.bindQueue(
        config.rabbitmq.queue,
        config.rabbitmq.exchange,
        config.rabbitmq.routingKey
      );

      logger.info('Connected to RabbitMQ and channel created');
    } catch (error) {
      logger.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async consumeEmailNotifications() {
    try {
      await this.channel.consume(config.rabbitmq.queue, async (message) => {
        if (message !== null) {
          try {
            const notification = JSON.parse(message.content.toString());
            logger.info('Received email notification:', notification);

            // Envoyer l'email
            await this.sendNotificationEmail(notification);

            // Ack the message
            this.channel.ack(message);
          } catch (error) {
            logger.error('Error processing message:', error);
            // Nack the message (don't requeue)
            this.channel.nack(message, false, false);
          }
        }
      });

      logger.info('Started consuming email notifications');
    } catch (error) {
      logger.error('Error setting up consumer:', error);
      throw error;
    }
  }

  async sendNotificationEmail(notification) {
    try {
      // Ici vous devrez obtenir le token d'accès pour l'utilisateur
      // Cela dépend de votre système d'authentification
      // Pour cet exemple, je suppose que vous avez un token système
      
      const emailData = {
        from: 'notifications@systeo.tn',
        to: notification.email, // L'email devrait être dans la notification
        subject: `Notification: ${notification.originalNotification.message}`,
        text: this.buildEmailContent(notification.originalNotification),
        userId: notification.userId
      };

      // Utilisez un token système ou un token utilisateur stocké
      const systemAccessToken = 'your-system-access-token'; // À remplacer par votre méthode d'obtention de token

      await gmailService.sendEmail(
        systemAccessToken,
        emailData,
        'system' // Ou l'ID utilisateur approprié
      );

      logger.info(`Email notification sent to ${notification.email}`);
    } catch (error) {
      logger.error('Error sending notification email:', error);
      throw error;
    }
  }

  buildEmailContent(notification) {
    return `
      Bonjour,

      Vous avez une notification non lue concernant :
      
      Projet: ${notification.projectName}
      Tâche: ${notification.taskName}
      Message: ${notification.message}
      
      Date: ${new Date(notification.commentDate).toLocaleString()}
      
      Connectez-vous à votre application pour plus de détails.
      
      Cordialement,
      Votre équipe Systeo
    `;
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}

module.exports = new RabbitMQService();