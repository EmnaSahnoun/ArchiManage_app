const gmailService = require("../services/gmailService");

// Envoyer un email
const sendEmail = async (req, res) => {
  try {
    const { accessToken, ...emailData } = req.body;
    
    // Convert files to attachment format if needed
    const attachments = [];
    if (req.files) {
      attachments.push(...req.files.map(file => ({
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer
      })));
    }

    const result = await gmailService.sendEmail(accessToken, {
      ...emailData,
      attachments: [...(emailData.attachments || []), ...attachments]
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error.message
    });
  }
};

// Get full email details
const getEmail = async (req, res) => {
  try {
    const { accessToken } = req.query;
    const { emailId } = req.params;
    const includeAttachments = req.query.includeAttachments === 'true';
    
    const email = await gmailService.getFullEmail(accessToken, emailId, includeAttachments);
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
    const emails = await gmailService.getInboxEmails(accessToken, maxResults);
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
    const emails = await gmailService.getSentEmails(accessToken, maxResults);
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
    
    await gmailService.deleteEmail(accessToken, emailId, permanent === 'true');
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
    
    await gmailService.markAsRead(accessToken, emailId);
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
