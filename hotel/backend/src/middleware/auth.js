const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Vérification token [msylla01] - 2025-10-01 17:27:03');
    
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
        isActive: true
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

    if (!user.isActive) {
      console.log('❌ Compte désactivé [msylla01]:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Authentification réussie [msylla01]:', user.email);
    req.user = user;
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

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès administrateur requis',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
