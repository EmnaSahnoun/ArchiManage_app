const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const companyRoutes = require('./src/routes/companyRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/companie', companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
