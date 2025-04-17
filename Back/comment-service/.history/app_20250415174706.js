const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middlewares
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create comments directory if not exists
const COMMENTS_DIR = path.join(__dirname, 'comments');
if (!fs.existsSync(COMMENTS_DIR)) {
  fs.mkdirSync(COMMENTS_DIR, { recursive: true });
  console.log('Comments directory created');
}

// Routes
const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes); // Préfixe API

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Comment service running on port ${PORT}`);
});