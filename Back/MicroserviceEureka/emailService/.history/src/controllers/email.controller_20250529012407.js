const { google } = require('googleapis');
const oAuth2Client = require('../config/auth');

exports.sendEmail = async (req, res) => {
  try {
    const { accessToken, emailData } = req.body;
    if (!accessToken || !emailData) {
      return res.status(400).send('Paramètres manquants');
    }

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

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

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data
    });
  }
};

exports.getSentEmails = async (req, res) => {
  try {
    const { accessToken, maxResults = 10 } = req.query;
    if (!accessToken) return res.status(400).send('Access token requis');

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['SENT'],
      maxResults: parseInt(maxResults)
    });

    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        return {
          id: msg.data.id,
          snippet: msg.data.snippet,
          payload: msg.data.payload,
          internalDate: msg.data.internalDate,
          labelIds: msg.data.labelIds,
          isRead: !msg.data.labelIds.includes('UNREAD')
        };
      })
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error retrieving sent emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ... (autres fonctions du contrôleur email)