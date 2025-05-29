const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../../data/users');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper function to get user directory
const getUserDir = (userId) => {
  const userDir = path.join(DATA_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    // Create subdirectories
    fs.mkdirSync(path.join(userDir, 'drafts'));
    fs.mkdirSync(path.join(userDir, 'inbox'));
    fs.mkdirSync(path.join(userDir, 'sent'));
  }
  return userDir;
};

// Save email to appropriate folder
const saveEmail = (userId, email, folder) => {
  const userDir = getUserDir(userId);
  const folderPath = path.join(userDir, folder);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  const filePath = path.join(folderPath, `${email.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(email, null, 2));
};

// Delete email from storage
const deleteEmail = (userId, emailId, folder) => {
  const userDir = getUserDir(userId);
  const filePath = path.join(userDir, folder, `${emailId}.json`);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

// Get all emails from a folder
const getEmailsFromFolder = (userId, folder) => {
  const userDir = getUserDir(userId);
  const folderPath = path.join(userDir, folder);
  
  if (!fs.existsSync(folderPath)) {
    return [];
  }
  
  const files = fs.readdirSync(folderPath);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(folderPath, file), 'utf8');
      return JSON.parse(content);
    });
};

// Get single email by ID from folder
const getEmailFromFolder = (userId, emailId, folder) => {
  const userDir = getUserDir(userId);
  const filePath = path.join(userDir, folder, `${emailId}.json`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }
  return null;
};

// Check if email exists in storage
const emailExists = (userId, emailId, folder) => {
  const userDir = getUserDir(userId);
  const filePath = path.join(userDir, folder, `${emailId}.json`);
  return fs.existsSync(filePath);
};

module.exports = {
  saveEmail,
  deleteEmail,
  getEmailsFromFolder,
  getEmailFromFolder,
  emailExists
};