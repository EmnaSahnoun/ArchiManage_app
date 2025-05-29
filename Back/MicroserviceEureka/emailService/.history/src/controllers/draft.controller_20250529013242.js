const { google } = require('googleapis');
const oAuth2Client = require('../config/auth.config');
exports.getDrafts = async (req, res) => {
  try {
    const { accessToken, maxResults = 10 } = req.query;
    if (!accessToken) return res.status(400).send('Access token requis');

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.drafts.list({
      userId: 'me',
      maxResults: parseInt(maxResults)
    });

    const drafts = await Promise.all(
      response.data.drafts.map(async (draft) => {
        const draftDetails = await gmail.users.drafts.get({
          userId: 'me',
          id: draft.id,
          format: 'full'
        });
        return {
          id: draft.id,
          message: draftDetails.data.message
        };
      })
    );

    res.json({ success: true, data: drafts });
  } catch (error) {
    console.error('Error retrieving drafts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteDraft = async(req, res) => {
  try {
    const { accessToken } = req.query;
    const { draftId } = req.params;
    
    if (!accessToken || !draftId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    await gmail.users.drafts.delete({
      userId: 'me',
      id: draftId
    });

    res.json({ success: true, message: 'Brouillon supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data
    });
  }
};
