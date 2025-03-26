const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  }));
  
  // Protection des headers
  app.use(helmet());

connectDB();

app.use("/company", companyRoutes);

module.exports = app;
