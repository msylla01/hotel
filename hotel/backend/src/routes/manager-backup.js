const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🏨 Chargement routes espace gérant [msylla01] - 2025-10-04 00:00:55');

// Middleware pour vérifier les droits gérant/admin
const managerAuth = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Droits gérant ou administrateur requis'
        });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentification gérant échouée'
    });
  }
};

// Schémas de validation mis à jour
const hourlyBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().required(),
  duration: Joi.number().min(1).max(5).required(), // 1h à 5h
  notes: Joi.string().optional().allow('')
});

const nightlyBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().required(), // Doit être >= 22h
  notes: Joi.string().optional().allow('')
});

const extendedBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
  clientFirstName: Joi.string().required(),
  clientLastName: Joi.string().required(),
  clientPhone: Joi.string().required(),
  clientIdType: Joi.string().valid('CNI', 'PASSPORT', 'PERMIS').required(),
  clientIdNumber: Joi.string().required(),
  notes: Joi.string().optional().allow('')
});

// GET /api/manager/dashboard - Dashboard gérant
router.get('/dashboard', managerAuth, async (req, res) => {
  try {
    console.log('📊 Dashboard gérant [msylla01] - 2025-10-04 00:00:55');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Récupérer toutes les données avec le nouveau modèle
    const [
      activeBookings,
      todayBookings,
      rooms,
      expiredBookings,
      dailyRevenue
    ] = await Promise.all([
      // Réservations actives
      prisma.managerBooking.findMany({
        where: { status: 'ACTIVE' },
        include: {
          room: { select: { name: true, type: true } }
        },
        orderBy: { checkOut: 'asc' }
      }),

      // Réservations du jour
      prisma.managerBooking.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          room: { select: { name: true, type: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Chambres avec réservations actives
      prisma.room.findMany({
        where: { isActive: true },
        include: {
          managerBookings: {
            where: { status: 'ACTIVE' },
            select: { 
              id: true, 
              checkOut: true, 
              type: true,
              totalAmount: true,
              clientFirstName: true,
              clientLastName: true
            }
          }
        }
      }),

      // Réservations expirées (à traiter)
      prisma.managerBooking.findMany({
        where: {
          status: 'ACTIVE',
          checkOut: { lt: new Date() }
        },
        include: {
          room: { select: { name: true, type: true } }
        }
      }),

      // Revenus du jour
      prisma.managerBooking.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          },
          paymentReceived: true
        },
        _sum: { totalAmount: true },
        _count: true
      })
    ]);

    // Calculer disponibilité des chambres
    const roomsAvailability = rooms.map(room => ({
      ...room,
      isOccupied: room.managerBookings.length > 0,
      currentBooking: room.managerBookings[0] || null,
      availableAt: room.managerBookings[0]?.checkOut || null
    }));

    // Marquer les réservations expirées
    for (const expiredBooking of expiredBookings) {
      await prisma.managerBooking.update({
        where: { id: expiredBooking.id },
        data: { 
          isExpired: true,
          status: 'EXPIRED'
        }
      });
    }

    // Statistiques
    const stats = {
      totalRooms: rooms.length,
      occupiedRooms: roomsAvailability.filter(r => r.isOccupied).length,
      availableRooms: roomsAvailability.filter(r => !r.isOccupied).length,
      activeBookings: activeBookings.length,
      expiredBookings: expiredBookings.length,
      todayBookings: todayBookings.length,
      todayRevenue: dailyRevenue._sum.totalAmount || 0,
      occupancyRate: Math.round((roomsAvailability.filter(r => r.isOccupied).length / rooms.length) * 100)
    };

    // Alertes
    const alerts = expiredBookings.map(booking => ({
      id: booking.id,
      type: 'EXPIRED',
      message: `Chambre ${booking.room.name} - Dépassement de ${Math.round((new Date() - new Date(booking.checkOut)) / (1000 * 60))} min`,
      booking,
      urgency: 'HIGH'
    }));

    // Tarifs horaires par type de chambre
    const hourlyRates = {
      'SINGLE': 15,
      'DOUBLE': 20,
      'SUITE': 35,
      'FAMILY': 25,
      'DELUXE': 45
    };

    console.log(`✅ Dashboard gérant: ${stats.occupiedRooms}/${stats.totalRooms} chambres occupées`);

    res.json({
      success: true,
      data: {
        stats,
        rooms: roomsAvailability,
        activeBookings,
        todayBookings: todayBookings.slice(0, 10),
        expiredBookings,
        alerts,
        hourlyRates
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur dashboard gérant [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur dashboard gérant',
      error: error.message
    });
  }
});

// POST /api/manager/booking/hourly - Réservation horaire (1h-5h)
router.post('/booking/hourly', managerAuth, async (req, res) => {
  try {
    const { error } = hourlyBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { roomId, checkIn, duration, notes } = req.body;

    // Vérifier disponibilité chambre
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée'
      });
    }

    if (room.managerBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Chambre actuellement occupée'
      });
    }

    // Calculer horaires et prix
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkInDate.getTime() + (duration * 60 * 60 * 1000));
    
    // Tarifs horaires par type de chambre
    const hourlyRates = {
      'SINGLE': 15,
      'DOUBLE': 20,
      'SUITE': 35,
      'FAMILY': 25,
      'DELUXE': 45
    };

    const hourlyRate = hourlyRates[room.type] || 20;
    const totalAmount = hourlyRate * duration;

    // Générer numéro de reçu unique
    const receiptNumber = `HR-${Date.now()}-${room.name.substring(0, 3).toUpperCase()}`;

    // Créer la réservation avec transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.managerBooking.create({
        data: {
          type: 'HOURLY',
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          duration,
          hourlyRate,
          totalAmount,
          receiptNumber,
          notes: notes || '',
          managerId: req.user.id,
          paymentMethod: 'CASH',
          paymentReceived: true,
          status: 'ACTIVE'
        },
        include: {
          room: { select: { name: true, type: true } }
        }
      });

      // Log de l'activité
      await tx.managerActivityLog.create({
        data: {
          action: 'CREATE',
          description: `Création séjour horaire - ${room.name} - ${duration}h`,
          details: {
            type: 'HOURLY',
            duration,
            amount: totalAmount,
            rate: hourlyRate
          },
          managerId: req.user.id,
          bookingId: newBooking.id
        }
      });

      return newBooking;
    });

    console.log(`✅ Réservation horaire créée [msylla01]: ${room.name} - ${duration}h - ${totalAmount}€`);

    res.status(201).json({
      success: true,
      message: 'Réservation horaire créée avec succès',
      booking,
      receipt: {
        number: receiptNumber,
        room: room.name,
        type: 'Séjour horaire',
        duration: `${duration} heure(s)`,
        checkIn: checkInDate.toLocaleString('fr-FR'),
        checkOut: checkOutDate.toLocaleString('fr-FR'),
        rate: `${hourlyRate}€/heure`,
        total: `${totalAmount}€`,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur réservation horaire [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur création réservation horaire',
      error: error.message
    });
  }
});

// POST /api/manager/booking/nightly - Réservation nuitée (22h-12h)
router.post('/booking/nightly', managerAuth, async (req, res) => {
  try {
    const { error } = nightlyBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { roomId, checkIn, notes } = req.body;

    // Vérifier disponibilité chambre
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!room || room.managerBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: room ? 'Chambre actuellement occupée' : 'Chambre non trouvée'
      });
    }

    // Horaires standardisés nuitée
    const checkInDate = new Date(checkIn);
    
    // Vérifier que l'heure d'entrée est >= 22h
    if (checkInDate.getHours() < 22) {
      return res.status(400).json({
        success: false,
        message: 'Les nuitées commencent à partir de 22h00'
      });
    }

    // Sortie le lendemain à 12h00
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    checkOutDate.setHours(12, 0, 0, 0);

    // Prix nuitée = prix de base de la chambre
    const totalAmount = room.price;
    const receiptNumber = `NT-${Date.now()}-${room.name.substring(0, 3).toUpperCase()}`;

    // Créer la réservation avec transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.managerBooking.create({
        data: {
          type: 'NIGHTLY',
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          duration: 1, // 1 nuit
          totalAmount,
          receiptNumber,
          notes: notes || '',
          managerId: req.user.id,
          paymentMethod: 'CASH',
          paymentReceived: true,
          status: 'ACTIVE'
        },
        include: {
          room: { select: { name: true, type: true } }
        }
      });

      // Log de l'activité
      await tx.managerActivityLog.create({
        data: {
          action: 'CREATE',
          description: `Création nuitée - ${room.name}`,
          details: {
            type: 'NIGHTLY',
            amount: totalAmount,
            checkIn: checkInDate,
            checkOut: checkOutDate
          },
          managerId: req.user.id,
          bookingId: newBooking.id
        }
      });

      return newBooking;
    });

    console.log(`✅ Réservation nuitée créée [msylla01]: ${room.name} - ${totalAmount}€`);

    res.status(201).json({
      success: true,
      message: 'Réservation nuitée créée avec succès',
      booking,
      receipt: {
        number: receiptNumber,
        room: room.name,
        type: 'Nuitée',
        checkIn: checkInDate.toLocaleString('fr-FR'),
        checkOut: checkOutDate.toLocaleString('fr-FR'),
        duration: '22h00 - 12h00 (+1 jour)',
        total: `${totalAmount}€`,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur réservation nuitée [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur création réservation nuitée',
      error: error.message
    });
  }
});

// POST /api/manager/booking/extended - Réservation prolongée (plusieurs jours)
router.post('/booking/extended', managerAuth, async (req, res) => {
  try {
    const { error } = extendedBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { 
      roomId, checkIn, checkOut, 
      clientFirstName, clientLastName, clientPhone, 
      clientIdType, clientIdNumber, notes 
    } = req.body;

    // Vérifier disponibilité chambre
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!room || room.managerBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: room ? 'Chambre actuellement occupée' : 'Chambre non trouvée'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Calculer nombre de jours
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'La durée doit être d\'au moins 1 jour'
      });
    }

    // Prix = prix chambre × nombre de jours
    const totalAmount = room.price * diffDays;
    const receiptNumber = `EXT-${Date.now()}-${room.name.substring(0, 3).toUpperCase()}`;

    // Créer la réservation avec transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.managerBooking.create({
        data: {
          type: 'EXTENDED',
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          duration: diffDays,
          totalAmount,
          clientFirstName,
          clientLastName,
          clientPhone,
          clientIdType,
          clientIdNumber,
          receiptNumber,
          notes: notes || '',
          managerId: req.user.id,
          paymentMethod: 'CASH',
          paymentReceived: true,
          status: 'ACTIVE'
        },
        include: {
          room: { select: { name: true, type: true } }
        }
      });

      // Log de l'activité
      await tx.managerActivityLog.create({
        data: {
          action: 'CREATE',
          description: `Création séjour prolongé - ${room.name} - ${diffDays} jours`,
          details: {
            type: 'EXTENDED',
            duration: diffDays,
            amount: totalAmount,
            client: `${clientFirstName} ${clientLastName}`,
            clientId: `${clientIdType}: ${clientIdNumber}`
          },
          managerId: req.user.id,
          bookingId: newBooking.id
        }
      });

      return newBooking;
    });

    console.log(`✅ Réservation prolongée créée [msylla01]: ${room.name} - ${diffDays} jours - ${totalAmount}€`);

    res.status(201).json({
      success: true,
      message: 'Réservation prolongée créée avec succès',
      booking,
      receipt: {
        number: receiptNumber,
        room: room.name,
        type: 'Séjour prolongé',
        client: `${clientFirstName} ${clientLastName}`,
        phone: clientPhone,
        id: `${clientIdType}: ${clientIdNumber}`,
        checkIn: checkInDate.toLocaleString('fr-FR'),
        checkOut: checkOutDate.toLocaleString('fr-FR'),
        duration: `${diffDays} jour(s)`,
        rate: `${room.price}€/jour`,
        total: `${totalAmount}€`,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur réservation prolongée [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur création réservation prolongée',
      error: error.message
    });
  }
});

// PUT /api/manager/booking/:id/checkout - Effectuer check-out
router.put('/booking/:id/checkout', managerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { actualCheckOut, additionalCharges = 0, notes } = req.body;

    const booking = await prisma.managerBooking.findUnique({
      where: { id },
      include: {
        room: { select: { name: true, type: true } }
      }
    });

    if (!booking || booking.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: booking ? 'Réservation déjà terminée' : 'Réservation non trouvée'
      });
    }

    const checkOutTime = actualCheckOut ? new Date(actualCheckOut) : new Date();
    let finalAmount = booking.totalAmount + additionalCharges;
    let status = 'COMPLETED';
    let overtimeCharge = 0;
    let overtimeMinutes = 0;

    // Vérifier dépassement pour réservations horaires
    if (booking.type === 'HOURLY' && checkOutTime > new Date(booking.checkOut)) {
      overtimeMinutes = Math.ceil((checkOutTime - new Date(booking.checkOut)) / (1000 * 60));
      const overtimeHours = Math.ceil(overtimeMinutes / 60);
      overtimeCharge = (booking.hourlyRate || 20) * overtimeHours;
      finalAmount += overtimeCharge;
      
      status = 'EXTENDED';
      console.log(`⚠️ Dépassement détecté: +${overtimeHours}h (+${overtimeMinutes}min) = +${overtimeCharge}€`);
    }

    // Mettre à jour la réservation avec transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.managerBooking.update({
        where: { id },
        data: {
          status,
          actualCheckOut: checkOutTime,
          totalAmount: finalAmount,
          paymentReceived: true,
          isExpired: overtimeMinutes > 0,
          overtimeMinutes: overtimeMinutes > 0 ? overtimeMinutes : null,
          overtimeCharge: overtimeCharge > 0 ? overtimeCharge : null,
          notes: notes ? `${booking.notes || ''}\nCheck-out: ${notes}` : booking.notes,
          updatedAt: new Date()
        },
        include: {
          room: { select: { name: true, type: true } }
        }
      });

      // Log de l'activité
      await tx.managerActivityLog.create({
        data: {
          action: 'CHECK_OUT',
          description: `Check-out ${booking.room.name}${overtimeCharge > 0 ? ` avec dépassement (+${overtimeCharge}€)` : ''}`,
          details: {
            originalAmount: booking.totalAmount,
            finalAmount,
            overtimeCharge,
            overtimeMinutes,
            additionalCharges
          },
          managerId: req.user.id,
          bookingId: id
        }
      });

      return updated;
    });

    console.log(`✅ Check-out effectué [msylla01]: ${booking.room.name} - ${finalAmount}€`);

    res.json({
      success: true,
      message: 'Check-out effectué avec succès',
      booking: updatedBooking,
      finalAmount,
      overtimeCharges: overtimeCharge,
      overtimeMinutes,
      additionalCharges,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur check-out [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du check-out',
      error: error.message
    });
  }
});

// GET /api/manager/reports/daily - Rapport journalier
router.get('/reports/daily', managerAuth, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [bookings, summary] = await Promise.all([
      prisma.managerBooking.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          room: { select: { name: true, type: true } },
          manager: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.managerBooking.groupBy({
        by: ['type', 'paymentMethod'],
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        _sum: { totalAmount: true },
        _count: true
      })
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const paidRevenue = bookings.filter(b => b.paymentReceived).reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      success: true,
      report: {
        date,
        bookings,
        summary: {
          totalBookings: bookings.length,
          totalRevenue,
          paidRevenue,
          pendingRevenue: totalRevenue - paidRevenue,
          byType: summary.reduce((acc, item) => {
            acc[item.type] = { count: item._count, revenue: item._sum.totalAmount || 0 };
            return acc;
          }, {}),
          byPaymentMethod: summary.reduce((acc, item) => {
            acc[item.paymentMethod] = { count: item._count, revenue: item._sum.totalAmount || 0 };
            return acc;
          }, {})
        }
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur rapport journalier [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur génération rapport',
      error: error.message
    });
  }
});

console.log('✅ Routes espace gérant chargées [msylla01] - 2025-10-04 00:00:55');

module.exports = router;
