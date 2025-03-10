const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const companyRoutes = require('./routes/c');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use('/api/company', companyRoutes);

// Démarrer le serveur
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
