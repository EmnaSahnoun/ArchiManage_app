const gmailService = require("../services/gmailService");

// Récupérer les brouillons
const getDraftsHandler = async (req, res) => {
  try {
    // Idem pour accessToken, préférer header/session
    const { accessToken, maxResults = 10 } = req.query;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: "Access token requis." });
    }

    const drafts = await gmailService.getDrafts(accessToken, maxResults);
    res.json({ success: true, data: drafts });
  } catch (error) {
    console.error("Erreur lors de la récupération des brouillons:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors de la récupération des brouillons.",
        details: error.response?.data || error.message 
    });
  }
};

// Supprimer un brouillon
const deleteDraftHandler = async (req, res) => {
  try {
    // Idem pour accessToken
    const { accessToken } = req.query;
    const { draftId } = req.params;

    if (!accessToken || !draftId) {
      return res.status(400).json({ success: false, error: "Paramètres manquants (accessToken, draftId)" });
    }

    await gmailService.deleteDraft(accessToken, draftId);
    res.json({ success: true, message: "Brouillon supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du brouillon:", error);
    res.status(error.response?.status || 500).json({ 
        success: false, 
        error: "Erreur lors de la suppression du brouillon.",
        details: error.response?.data || error.message 
    });
  }
};

module.exports = {
  getDraftsHandler,
  deleteDraftHandler,
};
