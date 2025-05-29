require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Eureka = require('eureka-js-client').Eureka;
// Importer les routes
const authRoutes = require("./src/routes/authRoutes");
const emailRoutes = require("./src/routes/emailRoutes");
const draftRoutes = require("./src/routes/draftRoutes");

const app = express();
app.use(cors()); // Activer CORS pour toutes les origines (à ajuster en production)
app.use(express.json()); // Pour parser le JSON des requêtes entrantes

const PORT = process.env.PORT || 8079;
const APP_NAME = process.env.APP_NAME || 'EmailService'; // Utiliser le nom de l'app depuis .env
const EUREKA_ENABLED = process.env.EUREKA_ENABLED === 'true'; // Vérifier si Eureka est activé
const EUREKA_HOSTNAME = process.env.EUREKA_HOSTNAME;
const EUREKA_PREFER_IP = process.env.EUREKA_PREFER_IP === 'true'; // Note: Pas d'effet direct dans eureka-js-client
const EUREKA_URL = process.env.EUREKA_URL;

let eurekaClient = null;
if (EUREKA_ENABLED) {
  if (!EUREKA_HOSTNAME || !EUREKA_URL) {
    console.error("Erreur: Les variables d'environnement EUREKA_HOSTNAME et EUREKA_URL sont requises lorsque EUREKA_ENABLED est true.");
    // Envisagez d'arrêter le processus si la configuration est essentielle:
    // process.exit(1); 
  } else {
    console.log("Configuration Eureka activée. Tentative d'enregistrement...");
    eurekaClient = new Eureka({
      instance: {
        app: APP_NAME, // Nom de l'application
        hostName: EUREKA_HOSTNAME, // Nom d'hôte de l'instance
        ipAddr: 'eureka.systeo.tn', // IP de l'instance (peut être dynamique, mais nécessaire)
        statusPageUrl: `http://${EUREKA_HOSTNAME}:${PORT}/info`,
        healthCheckUrl: `http://${EUREKA_HOSTNAME}:${PORT}/health`,
        homePageUrl: `http://${EUREKA_HOSTNAME}:${PORT}/`,
        port: {
          '$': PORT, // Port de l'application
          '@enabled': 'true',
        },
        vipAddress: APP_NAME, // Adresse VIP (souvent le nom de l'app)
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn', // Nom du data center ('MyOwn' ou 'Amazon')
        },
      },
      eureka: {
        serviceUrls: {
          default: [EUREKA_URL], // URL(s) du serveur Eureka
        },
        fetchRegistry: true, // Récupérer le registre
        registerWithEureka: true, // S'enregistrer auprès d'Eureka
        heartbeatInterval: 30000, // Intervalle des heartbeats (ms)
        registryFetchInterval: 30000, // Intervalle de récupération du registre (ms)
      },
    });

    // Démarrer le client Eureka
    eurekaClient.start((error) => {
      if (error) {
        console.error('Erreur lors du démarrage du client Eureka:', error);
      } else {
        console.log('Client Eureka démarré et enregistré avec succès.');
      }
    });

    // Ajouter des endpoints pour le statut et la santé (requis par Eureka)
    app.get('/info', (req, res) => res.json({ status: 'UP' }));
    app.get('/health', (req, res) => res.json({ status: 'UP' }));

    // Gérer l'arrêt propre du client Eureka
    const shutdown = () => {
      console.log('Arrêt du serveur...');
      if (eurekaClient) {
        eurekaClient.stop(() => {
          console.log('Client Eureka arrêté.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };
    process.on('SIGINT', shutdown); // Capture Ctrl+C
    process.on('SIGTERM', shutdown); // Capture les signaux d'arrêt
  }
} else {
  console.log("Configuration Eureka désactivée.");
}
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
