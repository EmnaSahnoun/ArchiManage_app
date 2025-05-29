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
  'http://localhost:3000/auth/google/callback'
);
// Générer l'URL d'authentification
app.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send'
      //'https://www.googleapis.com/auth/gmail.modify',
      //'https://mail.google.com/'
    ],
    prompt: 'consent'
  });
  res.redirect(url);
});

// Callback pour récupérer le token
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    
    // Vérifiez la présence du refresh token
    if (!tokens.refresh_token) {
      console.warn('No refresh token received. User might need to re-authenticate.');
    }
    
    // Stockez ces tokens en sécurité (DB ou session)
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Expiry Date:', new Date(tokens.expiry_date));
    
    // Redirection avec tous les tokens
    res.redirect(`${process.env.FRONTEND_REDIRECT_URI}?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token || ''}&expires_in=${tokens.expiry_date}`);
  } catch (error) {
    console.error('Error retrieving tokens', error);
    res.status(500).send('Authentication failed');
  }
});
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