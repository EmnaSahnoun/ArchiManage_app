require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import des routes
const authRoutes = require('./src/routes/authRoutes');
const emailRoutes = require('./src/routes/email.routes');
const draftRoutes = require('./src/routes/draftRoutes');
const tokenRoutes = require('./src/routes/token.routes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routes
app.use('/auth', authRoutes);
app.use('/emails', emailRoutes);
app.use('/drafts', draftRoutes);
app.use('/token', tokenRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API Gmail Manager is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('GET  /auth/google');
  console.log('GET  /auth/google/callback');
  console.log('POST /emails/send');
  console.log('GET  /emails/sent');
  console.log('GET  /emails/inbox');
  console.log('GET  /drafts');
  console.log('POST /token/refresh');
});