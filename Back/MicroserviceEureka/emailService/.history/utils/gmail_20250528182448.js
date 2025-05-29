const { google } = require('googleapis');
const { oauth2Client } = require('../config/oauth2');

// Configurer Gmail API
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Envoyer un email
const sendEmail = async (accessToken, from, to, subject, message) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      message
    ];
    
    const messageEncoded = Buffer.from(messageParts.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: messageEncoded
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Lire les emails
const getEmails = async (accessToken, maxResults = 10) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults
    });
    
    const messages = response.data.messages || [];
    const emails = [];
    
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });
      emails.push(email.data);
    }
    
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

module.exports = { sendEmail, getEmails };