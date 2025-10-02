const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Schema de validation pour nouvelle réservation
const createBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().min('now').required(),
  checkOut: Joi.date().greater(Joi.ref('checkIn')).required(),
  guests: Joi.number().integer().min(1).max(10).required(),
  specialRequests: Joi.string().max(500).optional().allow('')
});

// GET /api/bookings - Mes réservations AVEC VRAIES DONNÉES
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Récupération réservations RÉELLES [msylla01] - 2025-10-01 18:38:09:', req.user.id);

    const { status, limit = 20, page = 1 } = req.query;
    
    let whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          room: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
              images: true,
              description: true,
              amenities: true,
              size: true,
              capacity: true
            }
          },
          payment: {
            select: {
              id: true,
              status: true,
              method: true,
              transactionId: true,
              amount: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    // Calculer les informations supplémentaires
    const enrichedBookings = bookings.map(booking => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const now = new Date();
      
      // Peut annuler si pending ou confirmé et check-in dans plus de 24h
      const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && 
                       checkInDate > new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Statut de paiement basé sur les paiements existants
      let paymentStatus = 'PENDING';
      if (booking.payment && booking.payment.length > 0) {
        const lastPayment = booking.payment[booking.payment.length - 1];
        paymentStatus = lastPayment.status === 'COMPLETED' ? 'PAID' : lastPayment.status;
      }

      return {
        ...booking,
        nights,
        canCancel,
        paymentStatus,
        // Ajouter l'image principale de la chambre
        roomImage: booking.room.images && booking.room.images.length > 0 
          ? booking.room.images[0] 
          : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
      };
    });

    console.log(`✅ ${enrichedBookings.length} réservations RÉELLES trouvées [msylla01]`);

    res.json({
      success: true,
      bookings: enrichedBookings,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération réservations RÉELLES [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/stats - Statistiques utilisateur RÉELLES
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Récupération stats RÉELLES [msylla01]:', req.user.id);

    const [totalBookings, totalSpent, upcomingBookings, completedBookings] = await Promise.all([
      prisma.booking.count({
        where: { userId: req.user.id }
      }),
      prisma.booking.aggregate({
        where: {
          userId: req.user.id,
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        _sum: { totalAmount: true }
      }),
      prisma.booking.count({
        where: {
          userId: req.user.id,
          status: 'CONFIRMED',
          checkIn: { gte: new Date() }
        }
      }),
      prisma.booking.count({
        where: {
          userId: req.user.id,
          status: 'COMPLETED'
        }
      })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { createdAt: true }
    });

    const stats = {
      totalBookings,
      totalSpent: totalSpent._sum.totalAmount || 0,
      upcomingStays: upcomingBookings,
      completedStays: completedBookings,
      loyaltyPoints: Math.floor((totalSpent._sum.totalAmount || 0) / 10), // 1 point par 10€
      memberSince: user.createdAt,
      favoriteRooms: 2 // À implémenter avec table favorites
    };

    console.log('✅ Stats RÉELLES calculées [msylla01]:', stats);

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur stats RÉELLES [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      timestamp: new Date().toISOString()
    });
  }
});

// Autres routes existantes...
module.exports = router;
