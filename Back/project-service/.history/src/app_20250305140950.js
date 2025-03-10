const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const projectRoutes = require("./routes/projectRoutes");
const 

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/project", projectRoutes);

module.exports = app;
