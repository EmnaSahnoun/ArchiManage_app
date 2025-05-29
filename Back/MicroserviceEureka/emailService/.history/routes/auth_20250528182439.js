const express = require('express');
const router = express.Router();
const { authorizationUrl, oauth2Client } = require('../config/oauth2');
const axios = require('axios');

// Initier le flux OAuth
router.get('/google', (req, res) => {
  res.redirect(authorizationUrl);
});

// Callback après autorisation
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Renvoyer les tokens au frontend (à adapter selon votre besoin de sécurité)
    res.redirect(`${process.env.FRONTEND_URL}?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

// Rafraîchir le token
router.post('/refresh-token', async (req, res) => {
  const { refresh_token } = req.body;
  
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token'
    });
    
    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).send('Token refresh failed');
  }
});

module.exports = router;