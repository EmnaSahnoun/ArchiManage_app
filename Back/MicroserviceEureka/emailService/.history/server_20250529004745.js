require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Authentification
app.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://mail.google.com/'
    ],
    prompt: 'consent'
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('No code received');
    
    const { tokens } = await oAuth2Client.getToken(code);
    res.send(`Authentification réussie!<br>
      Access Token: ${tokens.access_token}<br>
      Refresh Token: ${tokens.refresh_token}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Erreur d\'authentification');
  }
});

// Gestion des emails
app.post('/send-email', async (req, res) => {
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
});

// Récupérer les emails envoyés
app.get('/sent-emails', async (req, res) => {
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
          // Vérifier si l'email a été lu
          isRead: !msg.data.labelIds.includes('UNREAD')
        };
      })
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error retrieving sent emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Supprimer un email spécifique
app.delete('/emails/:emailId', async (req, res) => {
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
});
// Récupérer les brouillons
app.get('/drafts', async (req, res) => {
  try {
    const { accessToken, maxResults = 10 } = req.query;
    if (!accessToken) return res.status(400).send('Access token requis');

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.drafts.list({
      userId: 'me',
      maxResults: parseInt(maxResults)
    });

    const drafts = await Promise.all(
      response.data.drafts.map(async (draft) => {
        const draftDetails = await gmail.users.drafts.get({
          userId: 'me',
          id: draft.id,
          format: 'full'
        });
        return {
          id: draft.id,
          message: draftDetails.data.message
        };
      })
    );

    res.json({ success: true, data: drafts });
  } catch (error) {
    console.error('Error retrieving drafts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Supprimer un brouillon spécifique
app.delete('/drafts/:draftId', async (req, res) => {
  try {
    const { accessToken } = req.query;
    const { draftId } = req.params;
    
    if (!accessToken || !draftId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    await gmail.users.drafts.delete({
      userId: 'me',
      id: draftId
    });

    res.json({ success: true, message: 'Brouillon supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data
    });
  }
});
// Récupérer les emails entrants avec statut de lecture
app.get('/inbox-emails', async (req, res) => {
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
//marquer un email comme lu
app.post('/mark-as-read', async (req, res) => {
  try {
    const { accessToken, emailId } = req.body;
    if (!accessToken || !emailId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    await gmail.users.messages.modify({
      userId: 'me',
      id: emailId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Vérifier si un email a été lu
app.get('/check-email-read/:emailId', async (req, res) => {
  try {
    const { accessToken } = req.query;
    const { emailId } = req.params;
    if (!accessToken || !emailId) {
      return res.status(400).send('Paramètres manquants');
    }

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject']
    });

    const isRead = !response.data.labelIds.includes('UNREAD');
    res.json({ 
      success: true, 
      data: {
        isRead,
        labels: response.data.labelIds,
        snippet: response.data.snippet
      }
    });
  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//Restaurer un email depuis la corbeille

// Rafraîchir le token
app.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send('Refresh token requis');

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    
    res.json({ 
      success: true, 
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('GET  /auth/google');
  console.log('GET  /auth/google/callback');
  console.log('POST /send-email');
  console.log('GET  /sent-emails');
  console.log('GET  /drafts');
  console.log('GET  /check-email-read/:emailId');
  console.log('POST /refresh-token');
});