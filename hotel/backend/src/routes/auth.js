const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Schemas de validation
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(''),
  address: Joi.string().max(200).optional().allow(''),
  birthDate: Joi.date().optional().allow(null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const reactivateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Tentative inscription [msylla01] - 2025-10-01 18:09:15:', req.body.email);

    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log('❌ Erreur validation inscription [msylla01]:', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { email, password, firstName, lastName, phone, address, birthDate } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe déjà',
        field: 'email',
        timestamp: new Date().toISOString()
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Préparer les données de création
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'CLIENT',
      isActive: true,
      emailVerified: false
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (phone && phone.trim()) {
      userData.phone = phone.trim();
    }
    if (address && address.trim()) {
      userData.address = address.trim();
    }
    if (birthDate) {
      userData.birthDate = new Date(birthDate);
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        birthDate: true,
        preferences: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Inscription réussie [msylla01]:', user.email);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur inscription [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Tentative connexion [msylla01] - 2025-10-01 18:09:15:', req.body.email);

    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = req.body;

    // Rechercher l'utilisateur (MÊME S'IL EST DÉSACTIVÉ)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        birthDate: true,
        preferences: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé [msylla01]:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
        field: 'email',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect [msylla01]:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
        field: 'password',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si c'est une suppression définitive (email modifié)
    if (user.email.includes('deleted_')) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte a été supprimé définitivement',
        timestamp: new Date().toISOString()
      });
    }

    // Générer le token JWT (MÊME POUR COMPTE DÉSACTIVÉ)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      birthDate: user.birthDate,
      preferences: user.preferences,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Message différent selon le statut
    const message = user.isActive 
      ? 'Connexion réussie' 
      : 'Connexion réussie - Compte temporairement désactivé';

    console.log('✅ Connexion réussie [msylla01]:', user.email, 'Active:', user.isActive);

    res.json({
      success: true,
      message,
      token,
      user: userResponse,
      accountStatus: {
        isActive: user.isActive,
        canReactivate: !user.isActive && user.preferences?.deactivation?.type === 'temporary',
        deactivationInfo: user.preferences?.deactivation || null
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur connexion [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/auth/reactivate - ROUTE PUBLIQUE (pas de token requis)
router.put('/reactivate', async (req, res) => {
  try {
    console.log('▶️ Tentative réactivation [msylla01] - 2025-10-01 18:09:15');

    const { error } = reactivateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur (même désactivé)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte trouvé avec cet email',
        field: 'email',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si c'est une suppression définitive
    if (user.email.includes('deleted_')) {
      return res.status(400).json({
        success: false,
        message: 'Ce compte a été supprimé définitivement et ne peut pas être réactivé',
        timestamp: new Date().toISOString()
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce compte est déjà actif',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que c'est une désactivation temporaire
    const deactivationInfo = user.preferences?.deactivation;
    if (!deactivationInfo || deactivationInfo.type !== 'temporary') {
      return res.status(400).json({
        success: false,
        message: 'Ce compte ne peut pas être réactivé automatiquement. Contactez le support.',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect',
        field: 'password',
        timestamp: new Date().toISOString()
      });
    }

    // Réactiver le compte
    const reactivatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        preferences: {
          ...user.preferences,
          reactivation: {
            date: new Date().toISOString(),
            previousDeactivation: deactivationInfo
          },
          // Supprimer les infos de désactivation
          deactivation: undefined
        },
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        birthDate: true,
        preferences: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Générer un nouveau token
    const token = jwt.sign(
      { 
        userId: reactivatedUser.id, 
        email: reactivatedUser.email,
        role: reactivatedUser.role,
        firstName: reactivatedUser.firstName,
        lastName: reactivatedUser.lastName,
        isActive: reactivatedUser.isActive
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Compte réactivé [msylla01]:', user.email);

    res.json({
      success: true,
      message: 'Compte réactivé avec succès ! Bon retour parmi nous ! 🎉',
      token,
      user: reactivatedUser,
      reactivationInfo: {
        date: new Date().toISOString(),
        deactivatedSince: deactivationInfo.date,
        wasDeactivatedFor: Math.floor((new Date() - new Date(deactivationInfo.date)) / (1000 * 60 * 60 * 24)) + ' jour(s)'
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur réactivation compte [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réactivation du compte',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/auth/verify - Vérifier le token (AUTORISE COMPTES DÉSACTIVÉS)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant',
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        birthDate: true,
        preferences: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si c'est une suppression définitive
    if (user.email.includes('deleted_')) {
      return res.status(401).json({
        success: false,
        message: 'Compte supprimé définitivement',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Token vérifié [msylla01]:', user.email, 'Active:', user.isActive);

    res.json({
      success: true,
      user,
      accountStatus: {
        isActive: user.isActive,
        canReactivate: !user.isActive && user.preferences?.deactivation?.type === 'temporary',
        deactivationInfo: user.preferences?.deactivation || null
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur vérification token [msylla01]:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

// Route temporaire pour créer un gérant (À SUPPRIMER EN PRODUCTION)
router.post('/create-manager', async (req, res) => {
  try {
    console.log('👨‍💼 Création gérant via API [msylla01] - 2025-10-04 00:12:49');

    // Vérifier si un gérant existe
    const existingManager = await prisma.user.findFirst({
      where: { role: 'MANAGER' }
    });

    if (existingManager) {
      return res.json({
        success: true,
        message: 'Un gérant existe déjà',
        manager: {
          email: existingManager.email,
          name: `${existingManager.firstName} ${existingManager.lastName}`
        },
        credentials: {
          email: 'gerant@hotelluxe.com',
          password: 'manager123'
        }
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('manager123', 10);

    // Créer le gérant
    const manager = await prisma.user.create({
      data: {
        email: 'gerant@hotelluxe.com',
        password: hashedPassword,
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+221 77 123 45 67',
        address: '123 Avenue des Hôtels, Dakar',
        role: 'MANAGER',
        isActive: true,
        emailVerified: true
      }
    });

    res.json({
      success: true,
      message: 'Compte gérant créé avec succès',
      manager: {
        id: manager.id,
        email: manager.email,
        name: `${manager.firstName} ${manager.lastName}`,
        role: manager.role
      },
      credentials: {
        email: 'gerant@hotelluxe.com',
        password: 'manager123'
      },
      access: {
        dashboard: 'http://localhost:3000/manager',
        hourly: 'http://localhost:3000/manager/booking/hourly',
        nightly: 'http://localhost:3000/manager/booking/nightly',
        extended: 'http://localhost:3000/manager/booking/extended',
        reports: 'http://localhost:3000/manager/reports'
      }
    });

  } catch (error) {
    console.error('❌ Erreur création gérant [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur création gérant',
      error: error.message
    });
  }
});
