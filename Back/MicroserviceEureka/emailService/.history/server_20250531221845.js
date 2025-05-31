require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Eureka = require('eureka-js-client').Eureka;
// Importer les routes
const authRoutes = require("./src/routes/authRoutes");
const emailRoutes = require("./src/routes/emailRoutes");
const draftRoutes = require("./src/routes/draftRoutes");

const app = express();

// Middlewares
app.use(cors({
  origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   credentials: true
})); 

app.use(express.json());
const PORT = process.env.PORT || 8079;
const client = new Eureka({
  instance: {
    app: 'emailService',
    instanceId: `e8.systeo.tn:emailService:${PORT}`, // Ajoutez ceci
    hostName: 'e8.systeo.tn',
    ipAddr: '161.97.88.195',
    port: {
      '$': PORT,
      '@enabled': 'true',
    },
    vipAddress: 'emailService',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
    // Ajoutez ces métadonnées si nécessaire
    metadata: {
      'management.port': PORT,
      'securePort': 443,
      'securePortEnabled': 'true'
    }
  },
  eureka: {
    host: 'eureka.systeo.tn',
    port: 443,
    servicePath: '/eureka/apps/',
    ssl: true,
  },
});

// Démarrer le client Eureka
client.start(error => {
  console.log(error || 'Client Eureka démarré avec succès');
});

// Gestion de la fermeture propre
process.on('SIGINT', () => {
  client.stop();
  process.exit();
});

// Utiliser les routes
app.use("/auth", authRoutes);
app.use("/emails", emailRoutes); // Préfixe pour toutes les routes liées aux emails
app.use("/drafts", draftRoutes); // Préfixe pour toutes les routes liées aux brouillons

// Route de base pour vérifier si le serveur fonctionne
app.get("/", (req, res) => {
  res.send("Serveur API Gmail fonctionnel.");
});

// Gestionnaire d'erreurs global (optionnel mais recommandé)
app.use((err, req, res, next) => {
  console.error("Erreur non gérée:", err.stack);
  res.status(500).json({ success: false, error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log("Endpoints disponibles:");
  console.log(`GET  /auth/google`);
  console.log(`GET  /auth/google/callback`);
  console.log(`POST /auth/refresh-token`);
  console.log(`POST /emails/send`);
  console.log(`GET  /emails/sent`);
  console.log(`GET  /emails/inbox`);
  console.log(`POST /emails/mark-as-read`);
  console.log(`GET  /emails/check-read/:emailId`);
  console.log(`DELETE /emails/:emailId`);
  console.log(`POST /emails/:emailId/restore`);
  console.log(`GET  /drafts`);
  console.log(`DELETE /drafts/:draftId`);
});
