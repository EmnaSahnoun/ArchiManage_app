const rateLimitStore = {
  count: 0,
  lastReset: Date.now(),
  quota: 250 // 250 requêtes/minute
};

// Middleware à ajouter avant vos routes Gmail
app.use('/gmail-api', (req, res, next) => {
  const now = Date.now();
  const timeWindow = 60 * 1000; // 1 minute
  
  // Réinitialisation du compteur si la fenêtre de temps est écoulée
  if (now - rateLimitStore.lastReset > timeWindow) {
    rateLimitStore.count = 0;
    rateLimitStore.lastReset = now;
  }

  // Vérification du quota
  if (rateLimitStore.count >= rateLimitStore.quota) {
    const waitTime = Math.ceil((rateLimitStore.lastReset + timeWindow - now) / 1000);
    return res.status(429).json({
      error: `Quota dépassé. Attendez ${waitTime} secondes.`,
      limits: {
        used: rateLimitStore.count,
        remaining: 0,
        reset: new Date(rateLimitStore.lastReset + timeWindow)
      }
    });
  }

  // Incrémentation et ajout des headers
  rateLimitStore.count++;
  res.set({
    'X-RateLimit-Limit': rateLimitStore.quota,
    'X-RateLimit-Remaining': rateLimitStore.quota - rateLimitStore.count,
    'X-RateLimit-Reset': Math.floor((rateLimitStore.lastReset + timeWindow) / 1000)
  });

  next();
});

app.get('/api-quota', async (req, res) => {
  try {
    const { accessToken } = req.query;
    if (!accessToken) return res.status(400).json({ error: 'Access token requis' });

    oAuth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Cette requête ne consomme pas de quota
    const quota = await gmail.users.getProfile({ userId: 'me' })
      .then(() => ({
        remaining: rateLimitStore.quota - rateLimitStore.count,
        used: rateLimitStore.count,
        reset: new Date(rateLimitStore.lastReset + 60000),
        limit: rateLimitStore.quota
      }));

    res.json({ success: true, quota });
  } catch (error) {
    console.error('Quota check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});