const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Création du dossier "comments" s'il n'existe pas
const commentsDir = path.join(__dirname, 'comments');

if (!fs.existsSync(commentsDir)) {
  fs.mkdirSync(commentsDir);
  console.log('Dossier "comments" créé.');
}

// Import des routes
const commentRoutes = require('./routes/commentRoutes');

// Middleware pour parser le JSON dans le corps des requêtes
app.use(bodyParser.json());

// Utilisation des routes
app.use('/comments', commentRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Comment service running on port ${PORT}`);
});
