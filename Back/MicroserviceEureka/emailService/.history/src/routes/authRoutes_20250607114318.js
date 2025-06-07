const express = require("express");
const authController = require("../controllers/authController");
const oAuth2Client = require('../config/googleAuth');
const router = express.Router();

// Route pour démarrer l'authentification Google
router.get("/google", authController.googleAuth);

// Route pour le callback Google après authentification
router.get("/google/callback", authController.googleAuthCallback);

// Route pour rafraîchir le token d'accès
router.post("/refresh-token", authController.refreshToken);
// Dans authRoutes.js
router.get('/system-init', async (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    prompt: "consent",
    login_hint: "archimanage.systeo@gmail.com" // Force ce compte
  });
  res.redirect(url);
});

// Callback spécial pour le compte système
router.get('/system-callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);
    
    // Sauvegarder les tokens pour le compte système
    await saveToken('system-account', tokens);
    
    res.send('Compte système configuré avec succès!');
  } catch (error) {
    console.error("Erreur configuration système:", error);
    res.status(500).send("Erreur lors de la configuration du compte système");
  }
});
module.exports = router;
