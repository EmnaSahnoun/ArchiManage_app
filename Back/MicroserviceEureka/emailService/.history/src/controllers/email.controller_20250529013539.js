const { google } = require('googleapis');
const oAuth2Client = require('../config/auth.config');

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

exports.deleteEmail = async(req, res) => {
  try {
    const { accessToken, permanent = false } = req.query;
    const { emailId } = req.params;
    
    if (!accessToken || !emailId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    if (permanent === 'true') {
      // Suppression définitive (corbeille bypassée)
      await gmail.users.messages.delete({
        userId: 'me',
        id: emailId
      });
    } else {
      // Déplacement vers la corbeille
      await gmail.users.messages.trash({
        userId: 'me',
        id: emailId
      });
    }

    res.json({ 
      success: true, 
      message: permanent ? 'Email supprimé définitivement' : 'Email déplacé vers la corbeille'
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data
    });
  }
};

exports.restoreEmail = async (req, res) => {
  try {
    const { accessToken } = req.query;
    const { emailId } = req.params;
    
    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    await gmail.users.messages.untrash({
      userId: 'me',
      id: emailId
    });

    res.json({ success: true, message: 'Email restauré depuis la corbeille' });
  } catch (error) {
    console.error('Error restoring email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Récupérer les emails entrants avec statut de lecture
exports.getInboxEmails = async(req, res) => {
  try {
    const { accessToken, maxResults = 20 } = req.query;
    if (!accessToken) return res.status(400).json({ error: 'Access token requis' });

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Récupère les emails de la boîte de réception
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: parseInt(maxResults)
    });

    // Traitement détaillé de chaque email
    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date']
        });

        return {
          id: msg.data.id,
          from: msg.data.payload.headers.find(h => h.name === 'From').value,
          subject: msg.data.payload.headers.find(h => h.name === 'Subject').value,
          date: msg.data.payload.headers.find(h => h.name === 'Date').value,
          isRead: !msg.data.labelIds.includes('UNREAD'), // Statut de lecture
          labels: msg.data.labelIds
        };
      })
    );

    res.json({ success: true, data: emails });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data
    });
  }
});
// ... (autres fonctions du contrôleur email)