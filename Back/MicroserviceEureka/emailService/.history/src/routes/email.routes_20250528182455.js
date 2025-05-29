const express = require('express');
const router = express.Router();
const { sendEmail, getEmails } = require('../utils/gmail');

// Envoyer un email
router.post('/send', async (req, res) => {
  const { accessToken, from, to, subject, message } = req.body;
  
  try {
    const result = await sendEmail(accessToken, from, to, subject, message);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les emails
router.get('/list', async (req, res) => {
  const { accessToken, maxResults } = req.query;
  
  try {
    const emails = await getEmails(accessToken, maxResults);
    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;