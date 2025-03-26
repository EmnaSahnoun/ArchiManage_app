const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");
const { keycloak } = require("../middlewares/authMiddleware");

require("dotenv").config();

const app = express();
app.use(express.json());

connectDB();

app.use("/company", companyRoutes);

module.exports = app;
