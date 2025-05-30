const oAuth2Client = require("../config/googleAuth");
require("dotenv").config();
// Démarrer le flux d'authentification Google
const googleAuth = (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      'https://www.googleapis.com/auth/gmail.compose',
      "https://mail.google.com/",
    ],
    prompt: "consent",
  include_granted_scopes: "true"
  });
  res.redirect(url);
};

// Gérer le callback après l'authentification Google
const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    console.
    if (!code) {
      return res.status(400).send("Code d'autorisation manquant.");
    }
    
    // Échange le code contre les tokens
    const { tokens } = await oAuth2Client.getToken(code);
    
    res.json({
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
  expiry_date: tokens.expiry_date
});
  } catch (error) {
    console.error("Erreur lors de l'échange du code:", error);
    res.redirect(`${process.env.FRONTEND_URL}/error?message=auth_failed`);
  }
};
// Rafraîchir le token d'accès
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: "Refresh token requis." });
    }

    // Créer une nouvelle instance ou cloner pour éviter les effets de bord
    const tempClient = new google.auth.OAuth2(
        oAuth2Client.clientId_,
        oAuth2Client.clientSecret_,
        oAuth2Client.redirectUri_
    );
    tempClient.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await tempClient.refreshAccessToken();
    res.json({
      success: true,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    });
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    // Fournir plus de détails si l'erreur vient de l'API Google
    const errorMessage = error.response?.data?.error_description || error.message;
    res.status(error.response?.status || 500).json({ success: false, error: "Impossible de rafraîchir le token.", details: errorMessage });
  }
};

module.exports = {
  googleAuth,
  googleAuthCallback,
  refreshToken,
};
