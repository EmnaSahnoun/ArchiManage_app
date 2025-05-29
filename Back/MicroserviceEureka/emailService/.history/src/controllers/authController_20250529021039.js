const oAuth2Client = require("../config/googleAuth");

// Démarrer le flux d'authentification Google
const googleAuth = (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://mail.google.com/",
    ],
    prompt: "consent", // Force l'affichage de l'écran de consentement
  });
  res.redirect(url);
};

// Gérer le callback après l'authentification Google
const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Code d'autorisation manquant.");
    }
    const { tokens } = await oAuth2Client.getToken(code);
    // Il est recommandé de ne pas afficher les tokens directement dans la réponse
    // mais de les stocker de manière sécurisée côté serveur ou de les renvoyer au client
    // via un mécanisme sécurisé pour qu'il les stocke (ex: localStorage, sessionStorage).
    // Pour cet exemple, nous les affichons, mais ce n'est PAS une bonne pratique en production.
    res.send(`Authentification réussie !<br>
              Access Token: ${tokens.access_token}<br>
              ${tokens.refresh_token ? `Refresh Token: ${tokens.refresh_token}<br>` : ''}
              Expiry Date: ${new Date(tokens.expiry_date).toLocaleString()}`);

  } catch (error) {
    console.error("Erreur lors de l'échange du code d'autorisation:", error);
    res.status(500).send("Erreur d'authentification Google.");
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
