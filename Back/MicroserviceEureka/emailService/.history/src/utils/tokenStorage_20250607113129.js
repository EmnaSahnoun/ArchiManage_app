const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '../../data/tokens');
const SYSTEM_ACCOUNT_ID = 'system-account';
if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true });
}

function saveToken(userId, token) {
  const filePath = path.join(TOKENS_DIR, `${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(token));
}

function getToken(userId) {
  const filePath = path.join(TOKENS_DIR, `${userId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return null;
}

module.exports = { saveToken, getToken };