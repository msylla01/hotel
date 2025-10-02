const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Vérification token [msylla01] - 2025-10-02 00:31:15');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('📝 Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('🎫 Token:', token ? `${token.slice(0, 20)}...` : 'Missing');

    if (!token) {
      console.log('❌ Token manquant [msylla01]');
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token décodé [msylla01]:', decoded.userId, decoded.email);

    // Récupérer l'utilisateur depuis la base
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        preferences: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé [msylla01]:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si c'est une suppression définitive
    if (user.email.includes('deleted_')) {
      console.log('❌ Compte supprimé définitivement [msylla01]:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Compte supprimé définitivement',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Authentification réussie [msylla01]:', user.email, 'Active:', user.isActive);
    
    // Ajouter les infos de statut
    req.user = {
      ...user,
      accountStatus: {
        isActive: user.isActive,
        canReactivate: !user.isActive && user.preferences?.deactivation?.type === 'temporary',
        deactivationInfo: user.preferences?.deactivation || null
      }
    };
    
    next();

  } catch (error) {
    console.error('❌ Erreur authentification [msylla01]:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'TOKEN_INVALID',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification',
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware pour vérifier que le compte est ACTIF (pour les actions sensibles)
const requireActiveAccount = (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Compte temporairement désactivé. Réactivez votre compte pour continuer.',
      code: 'ACCOUNT_DEACTIVATED',
      canReactivate: req.user.accountStatus.canReactivate,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès administrateur requis',
      timestamp: new Date().toISOString()
    });
  }
  
  // Vérifier que l'admin est actif
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Compte administrateur désactivé',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireActiveAccount,
  requireAdmin
};
