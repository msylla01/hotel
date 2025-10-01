const errorHandler = (err, req, res, next) => {
  console.error('Erreur [msylla01]:', err);

  // Erreur de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  }

  // Erreur Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'Conflit de données - Cette valeur existe déjà',
          field: err.meta?.target?.[0] || 'unknown',
          timestamp: new Date().toISOString()
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Enregistrement non trouvé',
          timestamp: new Date().toISOString()
        });
      case 'P2003':
        return res.status(400).json({
          message: 'Violation de contrainte de clé étrangère',
          timestamp: new Date().toISOString()
        });
      default:
        console.error('Erreur Prisma [msylla01]:', err);
        return res.status(500).json({
          message: 'Erreur de base de données',
          timestamp: new Date().toISOString()
        });
    }
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token invalide',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expiré',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erreur interne du serveur' 
    : err.message;

  res.status(statusCode).json({
    message,
    timestamp: new Date().toISOString(),
    developer: 'msylla01',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
