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

