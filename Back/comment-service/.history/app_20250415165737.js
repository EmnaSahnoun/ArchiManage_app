const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// 🔹 Création du dossier comments s'il n'existe pas
const commentsDir = path.join(__dirname, 'comments');

if (!fs.existsSync(commentsDir)) {
  fs.mkdirSync(commentsDir);
  console.log('Dossier "comments" créé.');
}

const commentRoutes = require('./routes/commentRoutes');

app.use(bodyParser.json());
app.use('/comments', commentRoutes);

app.listen(PORT, () => {
  console.log(`Comment service running on port ${PORT}`);
});
