const gmailService = require("../services/gmailService");

const getUserId = (req) => {
  // Use the authenticated user's email or the from address
  return req.user?.email || req.body.from || 'default-user';
};

// Envoyer un email
const sendEmail = async (req, res) => {
  try {
    const { accessToken, ...emailData } = req.body;
    const userId = emailData.from; // Utilisez l'email de l'expéditeur comme userId
    
    console.log("userId", userId);
    const attachments = [];
    if (req.files && req.files.length > 0) {
      attachments.push(...req.files.map(file => ({
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer
      })));
    }

    // S'assurer que emailData.attachments est un tableau
    const emailAttachments = Array.isArray(emailData.attachments) 
      ? emailData.attachments 
      : [];

    const result = await gmailService.sendEmail(
      accessToken, 
      {
        ...emailData,
        attachments: [...emailAttachments, ...attachments]
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
    const { accessToken ,  } = req.query;
    const { emailId } = req.params;
    const userId = getUserId(req);

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
    const { accessToken, maxResults } = req.query;
    const userId = getUserId(req);
    const emails = await gmailService.getInboxEmails(accessToken, maxResults,userId);
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
    const { accessToken, maxResults } = req.query;
    const userId = getUserId(req);
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
    const { accessToken, permanent } = req.query;
    const { emailId } = req.params;
    const userId = getUserId(req);
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
    const { accessToken } = req.query;
    const { emailId } = req.params;
    const userId = getUserId(req);
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


module.exports = {
  sendEmail,
  getEmail,
  getInbox,
  getSent,
  deleteEmail,
  markAsRead
};
