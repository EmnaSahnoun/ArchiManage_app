const gmailService = require("../services/gmailService");

const getUserId = (req) => {
  return req.user?.email || req.body.draftData?.from || 'default-user';
};
// Draft management
const createDraft = async (req, res) => {
  try {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    // Vérifiez que le Content-Type est correct
    if (!req.is('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: "Invalid content type",
        details: "Expected multipart/form-data"
      });
    }

    // Extraction des champs texte
    const {
      accessToken,
      from,
      to,
      subject,
      body
    } = req.body;

    const userId = from;

    // Validation des champs obligatoires
    if (!accessToken || !from || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: "accessToken, from and to are required"
      });
    }

    // Gestion des fichiers uploadés
    const fileAttachments = req.files?.map(file => ({
      filename: file.originalname,
      mimeType: file.mimetype,
      content: file.buffer
    })) || [];

    // Création du brouillon
    const draft = await gmailService.createDraft(
      accessToken,
      {
        from,
        to,
        subject,
        body,
        attachments: fileAttachments
      },
      userId
    );

    res.json({ success: true, data: draft });
  } catch (error) {
    console.error("Error in createDraft:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create draft",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getDraftsList = async (req, res) => {
  try {
    const { accessToken, maxResults,userId } = req.query;
   
    const drafts = await gmailService.getDrafts(accessToken, maxResults,userId);
    res.json({ success: true, data: drafts });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get drafts",
      details: error.message
    });
  }
};

const deleteDraft = async (req, res) => {
  try {
    const { accessToken,userId } = req.query;
    const { draftId } = req.params;
    
    await gmailService.deleteDraft(accessToken, draftId,userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete draft",
      details: error.message
    });
  }
};

const sendDraft = async (req, res) => {
  try {
    const { accessToken ,userId} = req.query;
    const { draftId } = req.params;
 
    const result = await gmailService.sendDraft(accessToken, draftId,userId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send draft",
      details: error.message
    });
  }
};

module.exports = {
  createDraft,
  getDraftsList,
  deleteDraft,
  sendDraft
};
