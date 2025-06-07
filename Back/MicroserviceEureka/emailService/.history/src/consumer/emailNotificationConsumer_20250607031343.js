const amqp = require('amqplib');
const { sendSystemEmail } = require('../services/gmailService');
const { getToken } = require('../utils/tokenStorage');

async function startEmailNotificationConsumer() {
  try {
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`);
    const channel = await connection.createChannel();
    
await channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: true });    const queue = await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });
    await channel.bindQueue(queue.queue, process.env.RABBITMQ_EXCHANGE, process.env.RABBITMQ_ROUTING_KEY);

    console.log('En attente de notifications...');

    channel.consume(queue.queue, async (msg) => {
      if (msg !== null) {
        try {
          const notification = JSON.parse(msg.content.toString());
          console.log('Notification reçue:', notification);

          // Envoyer l'email
          await sendSystemEmail(notification.userId, {
            to: notification.email,
            from: '"ArchiManage Notifications" <notifications@archimanage.com>',
            subject: notification.subject,
            text: notification.content
          });

          console.log('Email envoyé avec succès');
          channel.ack(msg);
        } catch (error) {
          console.error('Erreur de traitement du message:', error);
          // Vous pourriez vouloir envoyer le message à une queue DLQ ici
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error('Erreur dans le consumer RabbitMQ:', error);
    throw error;
  }
}

module.exports = { startEmailNotificationConsumer };