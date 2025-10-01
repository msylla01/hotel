const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

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

// Schema pour mise à jour réservation
const updateBookingSchema = Joi.object({
  specialRequests: Joi.string().max(500).optional().allow(''),
  guests: Joi.number().integer().min(1).max(10).optional()
});

// GET /api/bookings - Mes réservations
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Récupération réservations [msylla01]:', req.user.id);

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
              images: true
            }
          },
          payment: {
            select: {
              id: true,
              status: true,
              method: true,
              transactionId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    console.log(`✅ ${bookings.length} réservations trouvées [msylla01]`);

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        ...booking,
        canCancel: booking.status === 'PENDING' || 
                  (booking.status === 'CONFIRMED' && new Date(booking.checkIn) > new Date(Date.now() + 24 * 60 * 60 * 1000))
      })),
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
    console.error('❌ Erreur récupération réservations [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings - Créer une nouvelle réservation
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🆕 Nouvelle réservation [msylla01]:', req.user.id, req.body);

    const { error } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Vérifier que la chambre existe et est active
    const room = await prisma.room.findFirst({
      where: { id: roomId, isActive: true }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée ou indisponible',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier la capacité
    if (guests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cette chambre peut accueillir maximum ${room.capacity} personne(s)`,
        field: 'guests',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier les disponibilités
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } }
            ]
          },
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } }
            ]
          },
          {
            AND: [
              { checkIn: { gte: checkInDate } },
              { checkOut: { lte: checkOutDate } }
            ]
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'La chambre n\'est pas disponible pour ces dates',
        conflictingBookings: conflictingBookings.map(b => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Calculer le nombre de nuits et le montant total
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price * nights;

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalAmount,
        specialRequests: specialRequests || '',
        status: 'PENDING'
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true
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

    console.log('✅ Réservation créée [msylla01]:', booking.id);

    // Envoyer email de confirmation de réservation
    try {
      await emailService.sendBookingConfirmation(
        booking,
        { amount: totalAmount, transactionId: 'PENDING' },
        booking.user
      );
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email réservation [msylla01]:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      booking: {
        ...booking,
        canCancel: true
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur création réservation [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/:id - Détails d'une réservation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Détails réservation [msylla01]:', req.params.id);

    const booking = await prisma.booking.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: {
        room: true,
        payment: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    const canCancel = booking.status === 'PENDING' || 
                     (booking.status === 'CONFIRMED' && new Date(booking.checkIn) > new Date(Date.now() + 24 * 60 * 60 * 1000));

    res.json({
      success: true,
      booking: {
        ...booking,
        canCancel
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur détails réservation [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/bookings/:id - Modifier une réservation
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('✏️ Modification réservation [msylla01]:', req.params.id);

    const { error } = updateBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const booking = await prisma.booking.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: { room: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que la réservation peut être modifiée
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation ne peut plus être modifiée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier la capacité si le nombre de guests change
    if (req.body.guests && req.body.guests > booking.room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cette chambre peut accueillir maximum ${booking.room.capacity} personne(s)`,
        field: 'guests',
        timestamp: new Date().toISOString()
      });
    }

    // Mettre à jour la réservation
    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date()
      },
      include: {
        room: true,
        payment: true
      }
    });

    console.log('✅ Réservation modifiée [msylla01]:', updatedBooking.id);

    res.json({
      success: true,
      message: 'Réservation modifiée avec succès',
      booking: updatedBooking,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur modification réservation [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la réservation',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/bookings/:id - Annuler une réservation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🚫 Annulation réservation [msylla01]:', req.params.id);

    const booking = await prisma.booking.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: {
        room: true,
        payment: true,
        user: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que la réservation peut être annulée
    const canCancel = booking.status === 'PENDING' || 
                     (booking.status === 'CONFIRMED' && new Date(booking.checkIn) > new Date(Date.now() + 24 * 60 * 60 * 1000));

    if (!canCancel) {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation ne peut plus être annulée (délai dépassé)',
        timestamp: new Date().toISOString()
      });
    }

    // Annuler la réservation
    const cancelledBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Si il y a un paiement, marquer comme remboursé
    if (booking.payment && booking.payment.length > 0) {
      await prisma.payment.updateMany({
        where: { bookingId: req.params.id },
        data: { status: 'REFUNDED' }
      });
    }

    console.log('✅ Réservation annulée [msylla01]:', cancelledBooking.id);

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
      booking: cancelledBooking,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur annulation réservation [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/check-availability - Vérifier disponibilité
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'roomId, checkIn et checkOut sont requis',
        timestamp: new Date().toISOString()
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflictingBookings = await prisma.booking.count({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } }
            ]
          },
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } }
            ]
          },
          {
            AND: [
              { checkIn: { gte: checkInDate } },
              { checkOut: { lte: checkOutDate } }
            ]
          }
        ]
      }
    });

    const isAvailable = conflictingBookings === 0;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Chambre disponible' : 'Chambre non disponible pour ces dates',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur vérification disponibilité [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de disponibilité',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
