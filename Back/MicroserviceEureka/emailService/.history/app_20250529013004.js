const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', apiRouter);

module.exports = app;