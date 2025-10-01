const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Schema de validation pour mise à jour profil
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(''),
  address: Joi.string().max(200).optional().allow(''),
  birthDate: Joi.date().optional().allow(null),
  preferences: Joi.object({
    newsletter: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
    roomType: Joi.string().valid('SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE').optional(),
    specialRequests: Joi.string().max(500).optional().allow('')
  }).optional()
});

// GET /api/users/profile - Récupérer le profil utilisateur
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Récupération profil [msylla01]:', req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Profil récupéré [msylla01]:', user.email);

    res.json({
      success: true,
      user,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('❌ Erreur récupération profil [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/users/profile - Mettre à jour le profil utilisateur
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Mise à jour profil [msylla01]:', req.user.id, req.body);

    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (req.body.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: req.body.email,
          id: { not: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre compte',
          field: 'email',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Convertir la date de naissance si fournie
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    // Mettre à jour l'utilisateur en base
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
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

    console.log('✅ Profil mis à jour [msylla01]:', updatedUser.email);

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/users/change-password - Changer le mot de passe
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Changement mot de passe [msylla01]:', req.user.id);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation simple
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
        timestamp: new Date().toISOString()
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas',
        field: 'confirmPassword',
        timestamp: new Date().toISOString()
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
        field: 'newPassword',
        timestamp: new Date().toISOString()
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
        field: 'currentPassword',
        timestamp: new Date().toISOString()
      });
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    console.log('✅ Mot de passe changé [msylla01]:', user.email);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur changement mot de passe [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/stats - Statistiques utilisateur
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Récupération stats [msylla01]:', req.user.id);

    const [bookingsCount, totalSpent, completedBookings, upcomingBookings] = await Promise.all([
      prisma.booking.count({
        where: { userId: req.user.id }
      }),
      prisma.booking.aggregate({
        where: {
          userId: req.user.id,
          status: { in: ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'] }
        },
        _sum: { totalAmount: true }
      }),
      prisma.booking.count({
        where: {
          userId: req.user.id,
          status: 'COMPLETED'
        }
      }),
      prisma.booking.count({
        where: {
          userId: req.user.id,
          status: 'CONFIRMED',
          checkIn: { gte: new Date() }
        }
      })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { createdAt: true }
    });

    const stats = {
      totalBookings: bookingsCount,
      totalSpent: totalSpent._sum.totalAmount || 0,
      completedStays: completedBookings,
      upcomingStays: upcomingBookings,
      loyaltyPoints: Math.floor((totalSpent._sum.totalAmount || 0) / 10),
      memberSince: user.createdAt,
      favoriteRooms: 0
    };

    console.log('✅ Stats calculées [msylla01]:', stats);

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur stats utilisateur [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

// DELETE /api/users/account - Supprimer le compte utilisateur
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ Suppression compte [msylla01] - 2025-10-01 17:36:39:', req.user.id);

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe requis pour confirmer la suppression',
        field: 'password',
        timestamp: new Date().toISOString()
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe incorrect',
        field: 'password',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier s'il y a des réservations actives ou à venir
    const activeBookings = await prisma.booking.count({
      where: {
        userId: req.user.id,
        status: { in: ['CONFIRMED', 'PENDING'] },
        checkIn: { gte: new Date() }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer le compte : vous avez ${activeBookings} réservation(s) active(s). Veuillez les annuler d'abord.`,
        activeBookings,
        timestamp: new Date().toISOString()
      });
    }

    // Transaction pour supprimer toutes les données utilisateur
    await prisma.$transaction(async (tx) => {
      // Supprimer les avis
      await tx.review.deleteMany({
        where: { userId: req.user.id }
      });

      // Supprimer les paiements liés aux réservations de l'utilisateur
      await tx.payment.deleteMany({
        where: {
          booking: {
            userId: req.user.id
          }
        }
      });

      // Supprimer les réservations
      await tx.booking.deleteMany({
        where: { userId: req.user.id }
      });

      // Supprimer l'utilisateur (soft delete)
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          isActive: false,
          email: `deleted_${req.user.id}_${Date.now()}@deleted.com`,
          firstName: 'Compte',
          lastName: 'Supprimé',
          phone: null,
          address: null,
          birthDate: null,
          preferences: null,
          password: 'deleted',
          updatedAt: new Date()
        }
      });
    });

    console.log('✅ Compte supprimé avec succès [msylla01]:', user.email);

    res.json({
      success: true,
      message: 'Compte supprimé avec succès',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur suppression compte [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/users/deactivate - Désactiver temporairement le compte
router.put('/deactivate', authenticateToken, async (req, res) => {
  try {
    console.log('⏸️ Désactivation temporaire compte [msylla01] - 2025-10-01 17:47:22:', req.user.id);

    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe requis pour confirmer la désactivation',
        field: 'password',
        timestamp: new Date().toISOString()
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe incorrect',
        field: 'password',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier s'il y a des réservations confirmées à venir
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
        status: 'CONFIRMED',
        checkIn: { gte: new Date() }
      },
      include: {
        room: { select: { name: true } }
      }
    });

    if (upcomingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Vous avez ${upcomingBookings.length} réservation(s) confirmée(s) à venir. Veuillez les annuler ou attendre leur completion avant la désactivation.`,
        upcomingBookings: upcomingBookings.map(b => ({
          id: b.id,
          roomName: b.room.name,
          checkIn: b.checkIn,
          checkOut: b.checkOut
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Désactiver temporairement le compte
    const deactivatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        // Stocker les infos de désactivation dans preferences
        preferences: {
          ...user.preferences,
          deactivation: {
            reason: reason || 'Désactivation volontaire',
            date: new Date().toISOString(),
            type: 'temporary'
          }
        },
        updatedAt: new Date()
      }
    });

    console.log('✅ Compte désactivé temporairement [msylla01]:', user.email);

    res.json({
      success: true,
      message: 'Compte désactivé temporairement avec succès',
      deactivationInfo: {
        reason: reason || 'Désactivation volontaire',
        date: new Date().toISOString(),
        canReactivate: true
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur désactivation temporaire [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation du compte',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/users/reactivate - Réactiver le compte
router.put('/reactivate', async (req, res) => {
  try {
    console.log('▶️ Réactivation compte [msylla01] - 2025-10-01 17:47:22');

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
        timestamp: new Date().toISOString()
      });
    }

    // Trouver l'utilisateur désactivé
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte trouvé avec cet email',
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
        message: 'Ce compte ne peut pas être réactivé (suppression définitive)',
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
        lastName: reactivatedUser.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Compte réactivé [msylla01]:', user.email);

    res.json({
      success: true,
      message: 'Compte réactivé avec succès ! Bon retour parmi nous !',
      token,
      user: reactivatedUser,
      reactivationInfo: {
        date: new Date().toISOString(),
        deactivatedSince: deactivationInfo.date
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
