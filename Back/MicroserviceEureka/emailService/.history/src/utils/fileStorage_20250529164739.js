const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../../data/users');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

