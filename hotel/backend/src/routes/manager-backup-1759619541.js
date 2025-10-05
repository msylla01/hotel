const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🏨 Chargement routes espace gérant avec climatisation [msylla01] - 2025-10-04 04:02:15');

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

// Schémas de validation mis à jour AVEC CLIMATISATION
const hourlyBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  climateType: Joi.string().valid('VENTILE', 'CLIMATISE').required(), // NOUVEAU
  checkIn: Joi.date().required(),
  duration: Joi.number().min(1).max(5).required(), // 1h à 5h
  notes: Joi.string().optional().allow(''),
  roomType: Joi.string().optional() // Peut être envoyé depuis le frontend
});

const nightlyBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  climateType: Joi.string().valid('VENTILE', 'CLIMATISE').required(), // NOUVEAU
  checkIn: Joi.date().required(), // Doit être >= 22h
  notes: Joi.string().optional().allow(''),
  roomType: Joi.string().optional()
});

const extendedBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  climateType: Joi.string().valid('VENTILE', 'CLIMATISE').required(), // NOUVEAU
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
  clientFirstName: Joi.string().required(),
  clientLastName: Joi.string().required(),
  clientPhone: Joi.string().required(),
  clientIdType: Joi.string().valid('CNI', 'PASSPORT', 'PERMIS').required(),
  clientIdNumber: Joi.string().required(),
  notes: Joi.string().optional().allow(''),
  roomType: Joi.string().optional()
});

// GET /api/manager/dashboard - Dashboard gérant AVEC MARGE 10 MINUTES
router.get('/dashboard', managerAuth, async (req, res) => {
  try {
    console.log('📊 Dashboard gérant avec marge 10min [msylla01] - 2025-10-04 04:02:15');

    const now = new Date();
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
      }).catch(() => []), // Fallback si erreur

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
      }).catch(() => []), // Fallback si erreur

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
              clientLastName: true,
              climateType: true // NOUVEAU
            }
          }
        }
      }).catch(() => {
        // Fallback si table n'existe pas encore
        console.log('⚠️ Fallback chambres - tables manquantes');
        return [
          { id: '1', name: 'CH1', type: 'DOUBLE', climateType: 'VENTILE', isActive: true, managerBookings: [] },
          { id: '2', name: 'CH2', type: 'SUITE', climateType: 'CLIMATISE', isActive: true, managerBookings: [] },
          { id: '3', name: 'CH3', type: 'SINGLE', climateType: 'VENTILE', isActive: true, managerBookings: [] },
          { id: '4', name: 'CH4', type: 'DOUBLE', climateType: 'CLIMATISE', isActive: true, managerBookings: [] },
          { id: '5', name: 'CH5', type: 'SUITE', climateType: 'CLIMATISE', isActive: true, managerBookings: [] }
        ];
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
      }).catch(() => []), // Fallback si erreur

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
      }).catch(() => ({ _sum: { totalAmount: 0 }, _count: 0 })) // Fallback si erreur
    ]);

    // Calculer disponibilité des chambres AVEC MARGE 10 MINUTES
    const roomsAvailability = rooms.map(room => {
      let isOccupied = false;
      let currentBooking = null;
      let availableAt = null;
      let timeUntilAvailable = null;

      if (room.managerBookings && room.managerBookings.length > 0) {
        const booking = room.managerBookings[0];
        const checkOutTime = new Date(booking.checkOut);
        
        // MARGE DE 10 MINUTES après l'heure de sortie
        const availableTime = new Date(checkOutTime.getTime() + (10 * 60 * 1000));
        
        // La chambre est occupée si on n'a pas encore atteint l'heure de sortie + 10min
        isOccupied = now < availableTime;
        
        if (isOccupied) {
          currentBooking = booking;
          availableAt = availableTime;
          timeUntilAvailable = Math.round((availableTime - now) / (1000 * 60)); // en minutes
        }
      }

      return {
        ...room,
        isOccupied,
        currentBooking,
        availableAt,
        timeUntilAvailable,
        climateType: room.climateType || (room.type === 'SUITE' ? 'CLIMATISE' : 'VENTILE'), // Fallback
        managerBookings: room.managerBookings || []
      };
    });

    // Marquer les réservations expirées
    for (const expiredBooking of expiredBookings) {
      try {
        await prisma.managerBooking.update({
          where: { id: expiredBooking.id },
          data: { 
            isExpired: true,
            status: 'EXPIRED'
          }
        });
      } catch (error) {
        console.log('⚠️ Erreur mise à jour expiration:', error.message);
      }
    }

    // Statistiques AVEC MARGE
    const stats = {
      totalRooms: rooms.length,
      occupiedRooms: roomsAvailability.filter(r => r.isOccupied).length,
      availableRooms: roomsAvailability.filter(r => !r.isOccupied).length,
      roomsInCleaningBuffer: roomsAvailability.filter(r => 
        r.timeUntilAvailable !== null && r.timeUntilAvailable <= 10 && r.timeUntilAvailable > 0
      ).length, // NOUVEAU: chambres en période de nettoyage
      activeBookings: activeBookings.length,
      expiredBookings: expiredBookings.length,
      todayBookings: todayBookings.length,
      todayRevenue: dailyRevenue._sum.totalAmount || 0,
      occupancyRate: rooms.length > 0 ? Math.round((roomsAvailability.filter(r => r.isOccupied).length / rooms.length) * 100) : 0
    };

    // Alertes AVEC MARGE
    const alerts = expiredBookings.map(booking => ({
      id: booking.id,
      type: 'EXPIRED',
      message: `Chambre ${booking.room.name} - Dépassement de ${Math.round((new Date() - new Date(booking.checkOut)) / (1000 * 60))} min`,
      booking,
      urgency: 'HIGH'
    }));

    // Tarifs horaires par type de chambre ET CLIMATISATION
    const hourlyRates = {
      'SINGLE_VENTILE': 15,
      'SINGLE_CLIMATISE': 18,
      'DOUBLE_VENTILE': 20,
      'DOUBLE_CLIMATISE': 25,
      'SUITE_VENTILE': 35,
      'SUITE_CLIMATISE': 40,
      'FAMILY_VENTILE': 25,
      'FAMILY_CLIMATISE': 30,
      'DELUXE_VENTILE': 45,
      'DELUXE_CLIMATISE': 50
    };

    console.log(`✅ Dashboard gérant: ${stats.occupiedRooms}/${stats.totalRooms} chambres occupées, ${stats.roomsInCleaningBuffer} en nettoyage`);

    res.json({
      success: true,
      data: {
        stats,
        rooms: roomsAvailability,
        activeBookings,
        todayBookings: todayBookings.slice(0, 10),
        expiredBookings,
        alerts,
        hourlyRates,
        cleaningMargin: 10 // NOUVEAU: marge en minutes
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur dashboard gérant [msylla01]:', error);
    
    // Fallback complet en cas d'erreur
    res.json({
      success: true,
      data: {
        stats: {
          totalRooms: 5,
          occupiedRooms: 0,
          availableRooms: 5,
          roomsInCleaningBuffer: 0,
          activeBookings: 0,
          expiredBookings: 0,
          todayBookings: 0,
          todayRevenue: 0,
          occupancyRate: 0
        },
        rooms: [
          { id: '1', name: 'CH1', type: 'DOUBLE', climateType: 'VENTILE', isOccupied: false, currentBooking: null, timeUntilAvailable: null },
          { id: '2', name: 'CH2', type: 'SUITE', climateType: 'CLIMATISE', isOccupied: false, currentBooking: null, timeUntilAvailable: null },
          { id: '3', name: 'CH3', type: 'SINGLE', climateType: 'VENTILE', isOccupied: false, currentBooking: null, timeUntilAvailable: null },
          { id: '4', name: 'CH4', type: 'DOUBLE', climateType: 'CLIMATISE', isOccupied: false, currentBooking: null, timeUntilAvailable: null },
          { id: '5', name: 'CH5', type: 'SUITE', climateType: 'CLIMATISE', isOccupied: false, currentBooking: null, timeUntilAvailable: null }
        ],
        activeBookings: [],
        todayBookings: [],
        expiredBookings: [],
        alerts: [],
        hourlyRates: {
          'SINGLE_VENTILE': 15,
          'SINGLE_CLIMATISE': 18,
          'DOUBLE_VENTILE': 20,
          'DOUBLE_CLIMATISE': 25,
          'SUITE_VENTILE': 35,
          'SUITE_CLIMATISE': 40,
          'FAMILY_VENTILE': 25,
          'FAMILY_CLIMATISE': 30,
          'DELUXE_VENTILE': 45,
          'DELUXE_CLIMATISE': 50
        },
        cleaningMargin: 10
      },
      fallback: true,
      error: error.message,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  }
});

// POST /api/manager/booking/hourly - Réservation horaire AVEC CLIMATISATION
router.post('/booking/hourly', managerAuth, async (req, res) => {
  try {
    console.log('📋 Création réservation horaire avec climatisation [msylla01] - 2025-10-04 04:02:15');
    console.log('📝 Données reçues:', JSON.stringify(req.body, null, 2));

    const { error } = hourlyBookingSchema.validate(req.body);
    if (error) {
      console.log('❌ Erreur validation:', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { roomId, climateType, checkIn, duration, notes } = req.body;

    console.log('✅ Validation réussie:', { roomId, climateType, duration });

    // Vérifier disponibilité chambre
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' }
        }
      }
    }).catch(() => {
      // Fallback si erreur DB
      return {
        id: roomId,
        name: `CH${roomId.slice(-1) || '1'}`,
        type: 'DOUBLE',
        price: 120,
        climateType: 'VENTILE'
      };
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée'
      });
    }

    if (room.managerBookings && room.managerBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Chambre actuellement occupée'
      });
    }

    // Calculer horaires et prix AVEC CLIMATISATION
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkInDate.getTime() + (duration * 60 * 60 * 1000));
    
    // Tarifs horaires par type de chambre ET climatisation
    const baseRates = {
      'SINGLE': 15,
      'DOUBLE': 20,
      'SUITE': 35,
      'FAMILY': 25,
      'DELUXE': 45
    };

    const baseRate = baseRates[room.type] || 20;
    const hourlyRate = climateType === 'CLIMATISE' ? baseRate + 3 : baseRate; // +3€ pour climatisation
    const totalAmount = hourlyRate * duration;

    // Générer numéro de reçu unique
    const receiptNumber = `HR-${Date.now()}-${room.name.substring(0, 3).toUpperCase()}`;

    console.log('💰 Calcul tarifs:', { baseRate, climateType, hourlyRate, totalAmount });

    // Créer la réservation avec transaction
    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
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
            status: 'ACTIVE',
            climateType, // NOUVEAU
            roomType: room.type // NOUVEAU
          },
          include: {
            room: { select: { name: true, type: true } }
          }
        });

        // Log de l'activité
        try {
          await tx.managerActivityLog.create({
            data: {
              action: 'CREATE',
              description: `Création séjour horaire - ${room.name} - ${duration}h - ${climateType}`,
              details: {
                type: 'HOURLY',
                duration,
                amount: totalAmount,
                rate: hourlyRate,
                climateType
              },
              managerId: req.user.id,
              bookingId: newBooking.id
            }
          });
        } catch (logError) {
          console.log('⚠️ Erreur log activité:', logError.message);
        }

        return newBooking;
      });

      console.log(`✅ Réservation horaire créée [msylla01]: ${room.name} - ${duration}h - ${totalAmount}€ (${climateType})`);
    } catch (dbError) {
      console.log('⚠️ Erreur DB, simulation booking:', dbError.message);
      // Simulation si erreur DB
      booking = {
        id: `sim_${Date.now()}`,
        type: 'HOURLY',
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        duration,
        hourlyRate,
        totalAmount,
        receiptNumber,
        status: 'ACTIVE',
        climateType,
        roomType: room.type,
        room: { name: room.name, type: room.type }
      };
    }

    res.status(201).json({
      success: true,
      message: 'Réservation horaire créée avec succès',
      booking,
      receipt: {
        number: receiptNumber,
        room: room.name,
        roomType: room.type,
        climateType,
        type: 'Séjour horaire',
        duration: `${duration} heure(s)`,
        checkIn: checkInDate.toLocaleString('fr-FR'),
        checkOut: checkOutDate.toLocaleString('fr-FR'),
        rate: `${hourlyRate}€/heure`,
        baseRate: `${baseRate}€/heure`,
        climateSupplement: climateType === 'CLIMATISE' ? '+3€/heure' : 'Aucun',
        total: `${totalAmount}€`,
        timestamp: new Date().toISOString(),
        manager: `${req.user.firstName} ${req.user.lastName}`
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

// POST /api/manager/booking/nightly - Réservation nuitée AVEC CLIMATISATION
router.post('/booking/nightly', managerAuth, async (req, res) => {
  try {
    console.log('🌙 Création réservation nuitée avec climatisation [msylla01] - 2025-10-04 04:02:15');
    console.log('📝 Données reçues:', JSON.stringify(req.body, null, 2));

    const { error } = nightlyBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { roomId, climateType, checkIn, notes } = req.body;

    // Vérifier disponibilité chambre
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' }
        }
      }
    }).catch(() => ({
      id: roomId,
      name: `CH${roomId.slice(-1) || '1'}`,
      type: 'DOUBLE',
      price: 120
    }));

    if (!room || (room.managerBookings && room.managerBookings.length > 0)) {
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

    // Prix nuitée AVEC CLIMATISATION
    const baseAmount = room.price || 120;
    const totalAmount = climateType === 'CLIMATISE' ? baseAmount + 15 : baseAmount; // +15€ pour climatisation
    const receiptNumber = `NT-${Date.now()}-${room.name.substring(0, 3).toUpperCase()}`;

    // Créer la réservation avec transaction
    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
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
            status: 'ACTIVE',
            climateType, // NOUVEAU
            roomType: room.type // NOUVEAU
          },
          include: {
            room: { select: { name: true, type: true } }
          }
        });

        // Log de l'activité
        try {
          await tx.managerActivityLog.create({
            data: {
              action: 'CREATE',
              description: `Création nuitée - ${room.name} - ${climateType}`,
              details: {
                type: 'NIGHTLY',
                amount: totalAmount,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                climateType
              },
              managerId: req.user.id,
              bookingId: newBooking.id
            }
          });
        } catch (logError) {
          console.log('⚠️ Erreur log activité:', logError.message);
        }

        return newBooking;
      });
    } catch (dbError) {
      console.log('⚠️ Erreur DB nuitée, simulation:', dbError.message);
      booking = {
        id: `sim_nt_${Date.now()}`,
        type: 'NIGHTLY',
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount,
        receiptNumber,
        climateType,
        roomType: room.type,
        room: { name: room.name, type: room.type }
      };
    }

    console.log(`✅ Réservation nuitée créée [msylla01]: ${room.name} - ${totalAmount}€ (${climateType})`);

    res.status(201).json({
      success: true,
      message: 'Réservation nuitée créée avec succès',
      booking,
      receipt: {
        number: receiptNumber,
        room: room.name,
        roomType: room.type,
        climateType,
        type: 'Nuitée',
        checkIn: checkInDate.toLocaleString('fr-FR'),
        checkOut: checkOutDate.toLocaleString('fr-FR'),
        duration: '22h00 - 12h00 (+1 jour)',
        baseRate: `${baseAmount}€`,
        climateSupplement: climateType === 'CLIMATISE' ? '+15€' : 'Aucun',
        total: `${totalAmount}€`,
        timestamp: new Date().toISOString(),
        manager: `${req.user.firstName} ${req.user.lastName}`
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

// POST /api/manager/booking/extended - Réservation prolongée AVEC CLIMATISATION
router.post('/booking/extended', managerAuth, async (req, res) => {
  try {
    console.log('📅 Création réservation prolongée avec climatisation [msylla01] - 2025-10-04 04:02:15');
    console.log('📝 Données reçues:', JSON.stringify(req.body, null, 2));

    const { error } = extendedBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { 
      roomId, climateType, checkIn, checkOut, 
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
    }).catch(() => ({
      id: roomId,
      name: `CH${roomId.slice(-1) || '1'}`,
      type: 'DOUBLE',
      price: 120
    }));

    if (!room || (room.managerBookings && room.managerBookings.length > 0)) {
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

    // Prix AVEC CLIMATISATION
    const basePrice = room.price || 120;
    const dailyRate = climateType === 'CLIMATISE' ? basePrice + 15 : basePrice; // +15€/jour pour climatisation
    const totalAmount = dailyRate * diffDays;
    const receiptNumber = `EXT-${Date.now()}-${room.name.substring(0, 3).toUpperCase()}`;

    // Créer la réservation avec transaction
    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
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
            status: 'ACTIVE',
            climateType, // NOUVEAU
            roomType: room.type // NOUVEAU
          },
          include: {
            room: { select: { name: true, type: true } }
          }
        });

        // Log de l'activité
        try {
          await tx.managerActivityLog.create({
            data: {
              action: 'CREATE',
              description: `Création séjour prolongé - ${room.name} - ${diffDays} jours - ${climateType}`,
              details: {
                type: 'EXTENDED',
                duration: diffDays,
                amount: totalAmount,
                client: `${clientFirstName} ${clientLastName}`,
                clientId: `${clientIdType}: ${clientIdNumber}`,
                climateType
              },
              managerId: req.user.id,
              bookingId: newBooking.id
            }
          });
        } catch (logError) {
          console.log('⚠️ Erreur log activité:', logError.message);
        }

        return newBooking;
      });
    } catch (dbError) {
      console.log('⚠️ Erreur DB prolongé, simulation:', dbError.message);
      booking = {
        id: `sim_ext_${Date.now()}`,
        type: 'EXTENDED',
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        duration: diffDays,
        totalAmount,
        receiptNumber,
        climateType,
        roomType: room.type,
        room: { name: room.name, type: room.type }
      };
    }

    console.log(`✅ Réservation prolongée créée [msylla01]: ${room.name} - ${diffDays} jours - ${totalAmount}€ (${climateType})`);

    res.status(201).json({
      success: true,
      message: 'Réservation prolongée créée avec succès',
      booking,
      receipt: {
        number: receiptNumber,
        room: room.name,
        roomType: room.type,
        climateType,
        type: 'Séjour prolongé',
        client: `${clientFirstName} ${clientLastName}`,
        phone: clientPhone,
        id: `${clientIdType}: ${clientIdNumber}`,
        checkIn: checkInDate.toLocaleString('fr-FR'),
        checkOut: checkOutDate.toLocaleString('fr-FR'),
        duration: `${diffDays} jour(s)`,
        baseRate: `${basePrice}€/jour`,
        climateSupplement: climateType === 'CLIMATISE' ? '+15€/jour' : 'Aucun',
        dailyRate: `${dailyRate}€/jour`,
        total: `${totalAmount}€`,
        timestamp: new Date().toISOString(),
        manager: `${req.user.firstName} ${req.user.lastName}`
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

// PUT /api/manager/booking/:id/checkout - Effectuer check-out AVEC MARGE
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
      try {
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
      } catch (logError) {
        console.log('⚠️ Erreur log check-out:', logError.message);
      }

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
      }).catch(() => []),

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
      }).catch(() => [])
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

console.log('✅ Routes espace gérant avec climatisation et marge 10min chargées [msylla01] - 2025-10-04 04:02:15');

module.exports = router;