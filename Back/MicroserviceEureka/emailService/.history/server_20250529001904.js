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
  process.env.REDIRECT_URI);

// Endpoint d'initiation
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
});require('dotenv').config();
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

// Endpoint de callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('No code received');
    
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('Tokens received:', tokens);
    
    res.send(`Authentification réussie !<br>
      Access Token: ${tokens.access_token}<br>
      Refresh Token: ${tokens.refresh_token}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Erreur d\'authentification');
  }
});

app.listen(PORT, () => console.log('Server running on http://localhost:3000'));

app.post('/send-email', async (req, res) => {
  const { accessToken, emailData } = req.body;
  
  if (!accessToken || !emailData) {
    return res.status(400).send('Missing required parameters');
  }

  try {
    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const message = [
      `From: ${emailData.from}`,
      `To: ${emailData.to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
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
      requestBody: {
        raw: encodedMessage
      }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error sending email', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/get-emails', async (req, res) => {
  const { accessToken, maxResults = 10 } = req.query;
  
  if (!accessToken) {
    return res.status(400).send('Access token is required');
  }

  try {
    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: parseInt(maxResults)
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

    res.json({ success: true, data: emails });
  } catch (error) {
    console.error('Error retrieving emails', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).send('Refresh token is required');
  }

  try {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    
    res.json({ 
      success: true, 
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Error refreshing token', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});