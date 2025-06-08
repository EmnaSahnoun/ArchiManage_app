
const { google } = require('googleapis');
const oAuth2Client = require('../config/googleAuth');
const { saveToken } = require('../utils/tokenStorage');
require("dotenv").config();
// ID unique pour le compte système
const SYSTEM_USER_ID = 'system-account';

async function initializeSystemAuth() {
  try {
    // Utilisez un refresh token permanent pour le compte système
    const refreshToken = process.env.GOOGLE_SYSTEM_REFRESH_TOKEN;
    console.log('Initialisation avec refreshToken:', refreshToken ? 'présent' : 'absent');
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });

    // Rafraîchir le token d'accès
    const { credentials } = await oAuth2Client.refreshAccessToken();
     console.log('Nouveau access token obtenu:', credentials.access_token);
    
    // Sauvegarder le token pour le compte système
    await saveToken(SYSTEM_USER_ID, {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expiry_date: credentials.expiry_date
    });

    console.log('Authentification système initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'authentification système:', error);
    throw error;
  }
}

module.exports = {
  SYSTEM_USER_ID,
  initializeSystemAuth
};