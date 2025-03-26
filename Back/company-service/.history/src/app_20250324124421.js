const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // N'oubliez pas d'installer helmet: npm install helmet
const session = require("express-session");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");

require("dotenv").config();

const app = express();

// Configuration CORS avec valeur par défaut
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(helmet());
app.use(express.json());

connectDB();

app.use("/company", companyRoutes);

module.exports = app;