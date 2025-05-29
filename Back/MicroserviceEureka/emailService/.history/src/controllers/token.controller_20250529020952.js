const oAuth2Client = require('../config/googleAuth');
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send('Refresh token requis');

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    
    res.json({ 
      success: true, 
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};