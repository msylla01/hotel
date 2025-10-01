const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Token d\'accès requis',
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        firstName: true, 
        lastName: true,
        avatar: true 
      }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé ou inactif',
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expiré',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(403).json({ 
      message: 'Token invalide',
      timestamp: new Date().toISOString()
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      message: 'Accès administrateur requis',
      requiredRole: 'ADMIN',
      userRole: req.user.role,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

const requireStaffOrAdmin = (req, res, next) => {
  if (!['ADMIN', 'STAFF'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Accès staff ou administrateur requis',
      requiredRoles: ['ADMIN', 'STAFF'],
      userRole: req.user.role,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStaffOrAdmin
};
