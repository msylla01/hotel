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
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Génération du token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    const { email, firstName, lastName, phone, password } = req.body;

    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Un compte avec cet email existe déjà',
        timestamp: new Date().toISOString()
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        password: hashedPassword
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        phone: true,
        role: true,
        createdAt: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Inscription réussie !',
      token,
      user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect',
        timestamp: new Date().toISOString()
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect',
        timestamp: new Date().toISOString()
      });
    }

    const token = generateToken(user.id);

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    };

    res.json({
      message: `Bienvenue ${user.firstName} !`,
      token,
      user: userResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
