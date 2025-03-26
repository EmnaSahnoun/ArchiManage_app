const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");

require("dotenv").config();
const app = express();
app.use(express.json());
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000']; 

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
  
  app.use(helmet());

connectDB();

app.use("/company", companyRoutes);

module.exports = app;
