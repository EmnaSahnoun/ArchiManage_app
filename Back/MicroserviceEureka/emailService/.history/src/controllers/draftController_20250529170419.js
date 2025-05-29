const gmailService = require("../services/gmailService");


// Draft management
const createDraft = async (req, res) => {
  try {
    const { accessToken, draftData } = req.body;
    const draft = await gmailService.createDraft(accessToken, draftData);
    res.json({ success: true, data: draft });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create draft",
      details: error.message
    });
  }
};

const getDraftsList = async (req, res) => {
  try {
    const { accessToken, maxResults } = req.query;
    const drafts = await gmailService.getDrafts(accessToken, maxResults);
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
    const { accessToken } = req.query;
    const { draftId } = req.params;
    
    await gmailService.deleteDraft(accessToken, draftId);
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
    const { accessToken } = req.query;
    const { draftId } = req.params;
    
    const result = await gmailService.sendDraft(accessToken, draftId);
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
