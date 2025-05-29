const gmailService = require("../services/gmailService");

// Envoyer un email
const sendEmail = async (req, res) => {
  try {
    const { accessToken, emailData } = req.body;
    
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




// Récupérer les emails envoyés
const getSentEmailsHandler = async (req, res) => {
  try {
    // Idem pour accessToken, préférer header/session
    const { accessToken, maxResults = 10 } = req.query;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: "Access token requis." });
    }

    const messages = await gmailService.getSentEmails(accessToken, maxResults);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Erreur lors de la récupération des emails envoyés:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors de la récupération des emails envoyés.",
        details: error.response?.data || error.message 
    });
  }
};

// Supprimer un email
const deleteEmailHandler = async (req, res) => {
  try {
    const { accessToken, permanent = 'false' } = req.query; // Note: query params are strings
    const { emailId } = req.params;

    if (!accessToken || !emailId) {
      return res.status(400).json({ success: false, error: "Paramètres manquants (accessToken, emailId)" });
    }

    const isPermanent = permanent === 'true';
    await gmailService.deleteEmail(accessToken, emailId, isPermanent);
    res.json({ 
      success: true, 
      message: isPermanent ? "Email supprimé définitivement" : "Email déplacé vers la corbeille"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'email:", error);
     res.status(error.response?.status || 500).json({ 
      success: false, 
      error: "Erreur lors de la suppression de l'email.",
      details: error.response?.data || error.message 
    });
  }
};

// Restaurer un email depuis la corbeille
const restoreEmailHandler = async (req, res) => {
  try {
    // Idem pour accessToken
    const { accessToken } = req.query; 
    const { emailId } = req.params;

    if (!accessToken || !emailId) {
        return res.status(400).json({ success: false, error: "Paramètres manquants (accessToken, emailId)" });
    }

    await gmailService.restoreEmail(accessToken, emailId);
    res.json({ success: true, message: "Email restauré depuis la corbeille" });
  } catch (error) {
    console.error("Erreur lors de la restauration de l'email:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors de la restauration de l'email.",
        details: error.response?.data || error.message 
    });
  }
};

// Récupérer les emails entrants
const getInboxEmailsHandler = async (req, res) => {
  try {
    // Idem pour accessToken
    const { accessToken, maxResults = 20 } = req.query;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: "Access token requis." });
    }

    const emails = await gmailService.getInboxEmails(accessToken, maxResults);
    res.json({ success: true, data: emails });
  } catch (error) {
    console.error("Erreur lors de la récupération de la boîte de réception:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors de la récupération de la boîte de réception.",
        details: error.response?.data || error.message 
    });
  }
};

// Marquer un email comme lu
const markAsReadHandler = async (req, res) => {
  try {
    // Idem pour accessToken
    const { accessToken, emailId } = req.body;
    if (!accessToken || !emailId) {
      return res.status(400).json({ success: false, error: "Paramètres manquants (accessToken, emailId)" });
    }

    await gmailService.markAsRead(accessToken, emailId);
    res.json({ success: true, message: "Email marqué comme lu." });
  } catch (error) {
    console.error("Erreur lors du marquage comme lu:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors du marquage comme lu.",
        details: error.response?.data || error.message 
    });
  }
};

// Vérifier si un email a été lu
const checkEmailReadStatusHandler = async (req, res) => {
  try {
    // Idem pour accessToken
    const { accessToken } = req.query;
    const { emailId } = req.params;
    if (!accessToken || !emailId) {
      return res.status(400).json({ success: false, error: "Paramètres manquants (accessToken, emailId)" });
    }

    const status = await gmailService.checkEmailReadStatus(accessToken, emailId);
    res.json({ success: true, data: status });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut de lecture:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors de la vérification du statut de lecture.",
        details: error.response?.data || error.message 
    });
  }
};

// Récupérer un email complet avec tous ses éléments
const getFullEmailHandler = async (req, res) => {
  try {
    const { accessToken } = req.query;
    const { emailId } = req.params;

    if (!accessToken || !emailId) {
      return res.status(400).json({ 
        success: false, 
        error: "Paramètres manquants (accessToken, emailId)" 
      });
    }

    const email = await gmailService.getFullEmail(accessToken, emailId);
    
    // Optionnel: Récupérer les pièces jointes complètes si demandé
    if (req.query.includeAttachments === 'true') {
      for (const attachment of email.attachments) {
        attachment.fileData = await gmailService.getAttachment(
          accessToken, 
          emailId, 
          attachment.body.attachmentId
        );
      }
    }

    res.json({ success: true, data: email });
  } catch (error) {
    console.error("Erreur récupération email complet:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'email",
      details: error.message
    });
  }
};

// Récupérer les emails avec aperçu des pièces jointes
const getEmailsWithAttachmentsHandler = async (req, res) => {
  try {
    const { accessToken, maxResults = 10 } = req.query;
    
    const emails = await gmailService.getInboxEmails(accessToken, maxResults);
    const enhancedEmails = await Promise.all(
      emails.map(async email => {
        const fullEmail = await gmailService.getFullEmail(accessToken, email.id);
        return {
          ...email,
          hasAttachments: fullEmail.attachments.length > 0,
          attachmentsPreview: fullEmail.attachments.map(a => ({
            filename: a.filename,
            mimeType: a.mimeType,
            size: a.size
          }))
        };
      })
    );

    res.json({ success: true, data: enhancedEmails });
  } catch (error) {
    console.error("Erreur récupération emails avec pièces jointes:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des emails",
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
  createDraft,
  getDraftsList,
  deleteDraft,
  sendDraft
};
