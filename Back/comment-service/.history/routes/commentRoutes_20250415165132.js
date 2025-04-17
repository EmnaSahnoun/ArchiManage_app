const express = require('express');
const bodyParser = require('body-parser');
const commentRoutes = require('./routes/commentRoutes'); // <-- ton routeur

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use('/comments', commentRoutes); 

app.listen(PORT, () => {
  console.log(`Comment service running on port ${PORT}`);
});

// gestionnaire d’erreurs global
process.on('uncaughtException', function (err) {
  console.error('Erreur non attrapée :', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejection non gérée :', reason);
});
