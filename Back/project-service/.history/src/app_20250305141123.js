const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require('./routes/taskRoutes');
const phaseRoutes = require('./routes/phaseRoutes');
const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/project", projectRoutes);
app.use("/api/phase",phaseRoutes);
app.use("/api/task",taskRoutes)

module.exports = app;
