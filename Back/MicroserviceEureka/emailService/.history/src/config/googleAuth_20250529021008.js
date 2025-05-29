const { google } = require('googleapis');
require('dotenv').config(); // Assurez-vous que dotenv est chargé pour accéder aux variables d'environnement

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

module.exports = oAuth2Client;
