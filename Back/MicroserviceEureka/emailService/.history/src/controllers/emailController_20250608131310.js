const gmailService = require("../services/gmailService");
//const { sendSystemEmail } = require('../services/gmailService');
const systemAuth = require('../services/systemAuthService');
const getUserId = (req) => {
  // Use the authenticated user's email or the from address
  return req.user?.email || req.body.from || 'default-user';
};

// Envoyer un email
const sendEmail = async (req, res) => {
 try {
    const { accessToken, from, to, subject, text, attachments: emailAttachments = [] } = req.body;
    const userId = from;
    
    console.log("userId", userId);
    
    // Gestion des fichiers uploadés
    const fileAttachments = req.files?.map(file => ({
      filename: file.originalname,
      mimeType: file.mimetype,
      content: file.buffer
    })) || [];

    // Envoi de l'email
    const result = await gmailService.sendEmail(
      accessToken, 
      {
        from,
        to,
        subject,
        text,
        attachments: [...emailAttachments, ...fileAttachments]
      },
      userId
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get full email details
const getEmail = async (req, res) => {
  try {
    const { accessToken , userId } = req.query;
    const { emailId } = req.params;

    let email = gmailService.getEmailFromStorage(userId, emailId);

 if (!email) {
      const includeAttachments = req.query.includeAttachments === 'true';
      email = await gmailService.getFullEmail(accessToken, emailId, includeAttachments, userId);
    }
        res.json({ success: true, data: email });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get email",
      details: error.message
    });
  }
};
// Get inbox emails
const getInbox = async (req, res) => {
  try {
    const { accessToken, maxResults,userId } = req.query;
   
    let emails = await gmailService.getInboxEmails(accessToken, maxResults,userId);
emails = emails.filter(email => email && !email.skipped);
    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get inbox emails",
      details: error.message
    });
  }
};

// Get sent emails
const getSent = async (req, res) => {
  try {
    const { accessToken, maxResults ,userId} = req.query;
   
    const emails = await gmailService.getSentEmails(accessToken, maxResults,userId);
    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get sent emails",
      details: error.message
    });
  }
};
// Delete email
const deleteEmail = async (req, res) => {
  try {
    const { accessToken, permanent,userId } = req.query;
    const { emailId } = req.params;
 
    await gmailService.deleteEmail(accessToken, emailId, permanent === 'true',userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete email",
      details: error.message
    });
  }
};
// Mark as read
const markAsRead = async (req, res) => {
  try {
    const { accessToken,userId } = req.query;
    const { emailId } = req.params;
   
    await gmailService.markAsRead(accessToken, emailId);
    const folders = ['inbox', 'sent', 'drafts'];
    for (const folder of folders) {
      const email = gmailService.getEmailFromStorage(userId, emailId, folder);
      if (email) {
        email.isRead = true;
        emailStorage.saveEmail(userId, email, folder);
        break;
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to mark email as read",
      details: error.message
    });
  }
};

const sendSystemEmail = async (req, res) => {
  try {
    console.log('Requête reçue pour sendSystemEmail:', req.body);
    // Utilisez le compte système pour envoyer l'email
    const result = await gmailService.sendSystemEmail(
      systemAuth.SYSTEM_USER_ID, // L'ID du compte système
      req.body
    );

    res.json({ 
      success: true, 
      message: 'Email envoyé avec succès',
      data: result
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email système:", error);
    res.status(500).json({
      success: false,
      error: "Échec de l'envoi de l'email",
      details: error.message
    });
  }
};

module.exports = {
  sendEmail,
  getEmail,
  getInbox,
  getSent,
  deleteEmail,
  markAsRead,
  sendSystemEmail
};
