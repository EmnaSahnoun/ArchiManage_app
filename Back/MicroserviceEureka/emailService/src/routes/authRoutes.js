const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Route pour démarrer l'authentification Google
router.get("/google", authController.googleAuth);

// Route pour le callback Google après authentification
router.get("/google/callback", authController.googleAuthCallback);

// Route pour rafraîchir le token d'accès
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
