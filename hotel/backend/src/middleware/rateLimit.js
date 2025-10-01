const rateLimit = require('express-rate-limit');

// Rate limiting pour l'API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    timestamp: new Date().toISOString(),
    developer: 'msylla01'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting plus strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, réessayez dans 15 minutes.',
    timestamp: new Date().toISOString(),
    developer: 'msylla01'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter
};
