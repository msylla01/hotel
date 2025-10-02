const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireActiveAccount } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('📋 Routes bookings - VRAIES DONNÉES UNIQUEMENT [msylla01] - 2025-10-02 01:07:14');

// Schema de validation CORRIGÉ (échapper les apostrophes)
const createBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().min('now').required().messages({
    'date.min': 'La date d\'arrivee ne peut pas etre dans le passe'
  }),
  checkOut: Joi.date().greater(Joi.ref('checkIn')).required().messages({
    'date.greater': 'La date de depart doit etre apres la date d\'arrivee'
  }),
  guests: Joi.number().integer().min(1).max(10).required(),
  specialRequests: Joi.string().max(500).optional().allow('')
});

// GET /api/bookings - VRAIES réservations depuis DB
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 GET réservations DB [msylla01]:', req.user.id);

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

    // Enrichir avec calculs
    const enrichedBookings = bookings.map(booking => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const now = new Date();
      
      const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && 
                       checkInDate > new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
        roomImage: booking.room.images && booking.room.images.length > 0 
          ? booking.room.images[0] 
          : null
      };
    });

    console.log(`✅ ${enrichedBookings.length} réservations DB récupérées [msylla01]`);

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
    console.error('❌ Erreur GET bookings DB [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/stats - VRAIES stats depuis DB
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 GET stats DB [msylla01]:', req.user.id);

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
      loyaltyPoints: Math.floor((totalSpent._sum.totalAmount || 0) / 10),
      memberSince: user.createdAt,
      favoriteRooms: 0
    };

    console.log('✅ Stats DB calculées [msylla01]:', stats);

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur GET stats DB [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings - CRÉATION RÉELLE en DB uniquement
router.post('/', authenticateToken, requireActiveAccount, async (req, res) => {
  try {
    console.log('📝 CRÉATION réservation DB UNIQUEMENT [msylla01] - 2025-10-02 01:07:14');
    console.log('User:', req.user.id, req.user.email);
    console.log('Body:', req.body);

    // Validation Joi CORRIGÉE
    const { error } = createBookingSchema.validate(req.body);
    if (error) {
      console.log('❌ Erreur validation Joi [msylla01]:', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Vérifier que la chambre existe EN BASE
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée en base de données',
        field: 'roomId',
        timestamp: new Date().toISOString()
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cette chambre n\'est plus disponible',
        timestamp: new Date().toISOString()
      });
    }

    if (guests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cette chambre peut accueillir maximum ${room.capacity} personne(s)`,
        field: 'guests',
        timestamp: new Date().toISOString()
      });
    }

    // Validation manuelle des dates avec marge timezone
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    
    // Marge de 2 heures pour éviter problèmes timezone
    const nowWithMargin = new Date(now.getTime() - (2 * 60 * 60 * 1000));

    console.log('📅 Validation dates [msylla01]:', {
      checkIn: checkIn,
      checkInDate: checkInDate.toISOString(),
      checkOut: checkOut,
      checkOutDate: checkOutDate.toISOString(),
      now: now.toISOString(),
      nowWithMargin: nowWithMargin.toISOString()
    });

    // Validation avec marge généreuse
    if (checkInDate < nowWithMargin) {
      console.log('❌ Date arrivée trop ancienne [msylla01]');
      return res.status(400).json({
        success: false,
        message: 'La date d\'arrivée ne peut pas être dans le passé',
        field: 'checkIn',
        debug: {
          checkIn: checkInDate.toISOString(),
          minimumRequired: nowWithMargin.toISOString(),
          serverTime: now.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    if (checkOutDate <= checkInDate) {
      console.log('❌ Date départ incorrecte [msylla01]');
      return res.status(400).json({
        success: false,
        message: 'La date de départ doit être après la date d\'arrivée',
        field: 'checkOut',
        debug: {
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier conflits de réservation EN BASE
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            checkIn: { lte: checkInDate },
            checkOut: { gt: checkInDate }
          },
          {
            checkIn: { lt: checkOutDate },
            checkOut: { gte: checkOutDate }
          },
          {
            checkIn: { gte: checkInDate },
            checkOut: { lte: checkOutDate }
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cette chambre n\'est pas disponible pour ces dates',
        conflictingDates: conflictingBookings.map(b => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Calculer montant
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.price;

    console.log('💰 Calcul [msylla01]:', { nights, price: room.price, total: totalAmount });

    // CRÉER EN BASE
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalAmount,
        status: 'PENDING',
        specialRequests: specialRequests || null
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            images: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('✅ RÉSERVATION CRÉÉE EN BASE [msylla01]:', booking.id);

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès en base de données',
      booking: {
        ...booking,
        nights,
        canCancel: true,
        paymentStatus: 'PENDING'
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ ERREUR création réservation DB [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

console.log('✅ Routes bookings chargées [msylla01] - 2025-10-02 01:07:14');

module.exports = router;
