const oAuth2Client = require('../src/config/gmail.config');

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
  // Code existant du callback
};