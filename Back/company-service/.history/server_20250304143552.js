const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const companyRoutes = require('./routes/comp');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api/companie', companyRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
