const oAuth2Client = require('../config/googleAuth');

exports.getAuthUrl = (req, res) => {
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
};

exports.handleCallback = async (req, res) => {
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
};