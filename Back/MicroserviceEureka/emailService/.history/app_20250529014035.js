const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const emailRoutes = require('./src/routes/email.routes');
const draftRoutes = require('./src/routes/draft.routes');
const tokenRoutes = require('./src/routes/token.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', apiRouter);

module.exports = app;