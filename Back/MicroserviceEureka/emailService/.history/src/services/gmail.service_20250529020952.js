const { google } = require('googleapis');
const oAuth2Client = require('../config/googleAuth');

class GmailService {
  constructor(accessToken) {
    oAuth2Client.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  }

  async sendEmail(emailData) {
    const message = [
      `From: ${emailData.from}`,
      `To: ${emailData.to}`,
      'Content-Type: text/html; charset=utf-8',
      `Subject: ${emailData.subject}`,
      '',
      emailData.body
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });
  }

  // Autres méthodes...
}

module.exports = GmailService;