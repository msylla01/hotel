const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Schemas de validation CORRIGÉS
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(''), // AJOUTÉ
  address: Joi.string().max(200).optional().allow(''), // AJOUTÉ
  birthDate: Joi.date().optional().allow(null) // AJOUTÉ
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Tentative inscription [msylla01] - 2025-10-01 17:54:35:', req.body.email);

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
    console.log('🔐 Tentative connexion [msylla01] - 2025-10-01 17:54:35:', req.body.email);

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

    // Rechercher l'utilisateur
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

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Utilisez la fonction de réactivation.',
        reactivationAvailable: true,
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

    // Générer le token JWT avec plus d'infos
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

    console.log('✅ Connexion réussie [msylla01]:', user.email, 'Token généré');

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userResponse,
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

// GET /api/auth/verify - Vérifier le token
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

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou compte désactivé',
        reactivationAvailable: user && !user.isActive,
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Token vérifié [msylla01]:', user.email);

    res.json({
      success: true,
      user,
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
