const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");
const { keycloak } = require("./middleware/authMiddleware");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(keycloak.middleware());

connectDB();

app.use("/company", companyRoutes);

module.exports = app;
