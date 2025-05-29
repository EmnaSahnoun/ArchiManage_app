require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuration OAuth2
const oAuth2Client = new google.auth.OAuth2(
  '272700212454-9s5a11um6udgkmpgiin3j0mngvbua4pa.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/auth/google/callback'
);

// Stockage en mémoire (remplacez par une base de données en production)
let tokenStore = {};

// Middleware pour vérifier l'authentification
const authenticate = (req, res, next) => {
  const { accessToken } = req.query || req.body;
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token required' });
  }
  oAuth2Client.setCredentials({ access_token: accessToken });
  next();
};

// Endpoint d'authentification
app.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    prompt: 'consent'
  });
  res.redirect(url);
});

// Callback OAuth
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('Authorization code missing');

    const { tokens } = await oAuth2Client.getToken(code);
    tokenStore = tokens; // Stockez en base de données en production

    res.send(`
      <h1>Authentification réussie</h1>
      <p>Access Token: ${tokens.access_token}</p>
      <p>Refresh Token: ${tokens.refresh_token || 'Non fourni'}</p>
      <p>Expire dans: ${Math.round((tokens.expiry_date - Date.now())) / 1000} secondes</p>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

// Envoi d'email
app.post('/send-email', authenticate, async (req, res) => {
  try {
    const { emailData } = req.body;
    if (!emailData || !emailData.to || !emailData.subject || !emailData.body) {
      return res.status(400).json({ error: 'Invalid email data' });
    }

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const message = [
      `From: ${emailData.from || 'me'}`,
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

    res.json({ 
      success: true, 
      messageId: response.data.id 
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Récupération des emails
app.get('/get-emails', authenticate, async (req, res) => {
  try {
    const { maxResults = 10 } = req.query;
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: parseInt(maxResults)
    });

    res.json({ 
      success: true, 
      messages: response.data.messages || [] 
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Rafraîchissement du token
app.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    tokenStore = credentials; // Mise à jour du stockage

    res.json({
      success: true,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET  /auth/google`);
  console.log(`- GET  /auth/google/callback`);
  console.log(`- POST /send-email`);
  console.log(`- GET  /get-emails`);
  console.log(`- POST /refresh-token`);
});