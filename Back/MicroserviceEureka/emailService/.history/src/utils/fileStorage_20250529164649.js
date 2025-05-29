const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../../data/users');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
// Créer le dossier utilisateur s'il n'existe pas
const ensureUserDir = (userId) => {
  const userDir = path.join(DATA_DIR, userId);
  const draftsDir = path.join(userDir, 'drafts');
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    fs.mkdirSync(draftsDir);
    fs.writeFileSync(path.join(userDir, 'emails.json'), '[]');
  }
  
  return { userDir, draftsDir };
};

// Sauvegarder les emails
const saveEmails = (userId, emails) => {
  const { userDir } = ensureUserDir(userId);
  const filePath = path.join(userDir, 'emails.json');
  fs.writeFileSync(filePath, JSON.stringify(emails, null, 2));
};

// Charger les emails
const loadEmails = (userId) => {
  const { userDir } = ensureUserDir(userId);
  const filePath = path.join(userDir, 'emails.json');
  return JSON.parse(fs.readFileSync(filePath));
};

// Sauvegarder un brouillon
const saveDraft = (userId, draftId, draftData) => {
  const { draftsDir } = ensureUserDir(userId);
  const filePath = path.join(draftsDir, `${draftId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(draftData, null, 2));
};

// Charger un brouillon
const loadDraft = (userId, draftId) => {
  const { draftsDir } = ensureUserDir(userId);
  const filePath = path.join(draftsDir, `${draftId}.json`);
  return JSON.parse(fs.readFileSync(filePath));
};

// Supprimer un brouillon
const deleteDraftFile = (userId, draftId) => {
  const { draftsDir } = ensureUserDir(userId);
  const filePath = path.join(draftsDir, `${draftId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Supprimer un email de la liste
const deleteEmailFromFile = (userId, emailId) => {
  const emails = loadEmails(userId);
  const updatedEmails = emails.filter(email => email.id !== emailId);
  saveEmails(userId, updatedEmails);
};

module.exports = {
  saveEmails,
  loadEmails,
  saveDraft,
  loadDraft,
  deleteDraftFile,
  deleteEmailFromFile
};