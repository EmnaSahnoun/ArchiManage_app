const { sendEmail } = require('../services/gmailService');
const { setupRabbitMQ } = require('../config/rabbitmq');

async function startEmailNotificationConsumer() {
  try {
    const { channel } = await setupRabbitMQ();

    console.log('En attente de messages...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const notification = JSON.parse(msg.content.toString());
          console.log('Notification reçue:', notification);

          // Préparer l'email
          const emailData = {
            from: 'noreply@yourdomain.com',
            to: notification.email,
            subject: notification.subject,
            text: notification.content
          };

          // Envoyer l'email
          // Note: Vous aurez besoin d'un token d'accès valide ici
          // Vous pourriez avoir besoin de stocker les tokens par utilisateur
          const accessToken = await getAccessTokenForUser(notification.userId); // À implémenter
          
          await sendEmail(accessToken, emailData, notification.userId);
          console.log('Email envoyé avec succès à:', notification.email);

          // Ack le message
          channel.ack(msg);
        } catch (error) {
          console.error('Erreur de traitement du message:', error);
          // Vous pourriez vouloir mettre le message dans une DLQ (Dead Letter Queue)
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error('Erreur du consumer RabbitMQ:', error);
  }
}

module.exports = { startEmailNotificationConsumer };