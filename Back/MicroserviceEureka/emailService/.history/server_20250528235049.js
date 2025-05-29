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
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.metadata',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.settings.basic',
      'https://www.googleapis.com/auth/gmail.settings.sharing',
    ],
    prompt: 'consent'
  });
  res.redirect(url);
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