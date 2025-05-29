const { google } = require('googleapis');
require('dotenv').config();

module.exports = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);