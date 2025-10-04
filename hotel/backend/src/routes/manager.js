const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { managerAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🏨 Chargement routes espace gérant [msylla01] - 2025-10-04 01:27:33');

// Schémas de validation
const hourlyBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().required(),
  duration: Joi.number().min(1).max(5).required(),
  notes: Joi.string().optional().allow('')
});

const nightlyBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkIn: Joi.date().required(),
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

// GET /api/manager/test - Route de test simple
router.get('/test', managerAuth, async (req, res) => {
  try {
    console.log('🧪 Test accès gérant [msylla01]:', req.user?.email);
    
    res.json({
      success: true,
      message: 'Accès gérant fonctionnel !',
      user: {
        email: req.user.email,
        role: req.user.role,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('❌ Erreur test gérant [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur test gérant',
      error: error.message
    });
  }
});

// GET /api/manager/dashboard - Dashboard gérant
router.get('/dashboard', managerAuth, async (req, res) => {
  try {
    console.log('📊 Dashboard gérant [msylla01] - 2025-10-04 01:27:33');
    console.log('👤 Utilisateur connecté:', req.user?.email, 'Role:', req.user?.role);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Récupérer les chambres avec leurs réservations actives
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' },
          select: { 
            id: true, 
            type: true,
            checkOut: true, 
            totalAmount: true,
            clientFirstName: true,
            clientLastName: true
          }
        }
      }
    }).catch(error => {
      console.log('⚠️ Erreur Prisma managerBookings, utilisation fallback:', error.message);
      // Fallback si la table managerBookings n'existe pas encore
      return prisma.room.findMany({
        where: { isActive: true }
      });
    });

    console.log('�� Chambres récupérées:', rooms.length);

    // Calculer disponibilité des chambres avec fallback
    const roomsAvailability = rooms.map(room => ({
      ...room,
      isOccupied: room.managerBookings?.length > 0 || false,
      currentBooking: room.managerBookings?.[0] || null,
      availableAt: room.managerBookings?.[0]?.checkOut || null,
      managerBookings: room.managerBookings || []
    }));

    // Statistiques
    const stats = {
      totalRooms: rooms.length,
      occupiedRooms: roomsAvailability.filter(r => r.isOccupied).length,
      availableRooms: roomsAvailability.filter(r => !r.isOccupied).length,
      activeBookings: roomsAvailability.filter(r => r.isOccupied).length,
      expiredBookings: 0,
      todayBookings: 0,
      todayRevenue: 0,
      occupancyRate: rooms.length > 0 ? Math.round((roomsAvailability.filter(r => r.isOccupied).length / rooms.length) * 100) : 0
    };

    // Tarifs horaires par type de chambre
    const hourlyRates = {
      'SINGLE': 15,
      'DOUBLE': 20,
      'SUITE': 35,
      'FAMILY': 25,
      'DELUXE': 45
    };

    console.log('📊 Stats calculées:', stats);

    res.json({
      success: true,
      data: {
        stats,
        rooms: roomsAvailability,
        activeBookings: [],
        todayBookings: [],
        expiredBookings: [],
        alerts: [],
        hourlyRates
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur dashboard gérant [msylla01]:', error);
    
    // Fallback data complet
    res.json({
      success: true,
      data: {
        stats: {
          totalRooms: 5,
          occupiedRooms: 0,
          availableRooms: 5,
          activeBookings: 0,
          expiredBookings: 0,
          todayBookings: 0,
          todayRevenue: 0,
          occupancyRate: 0
        },
        rooms: [
          { id: '1', name: 'Chambre 101', type: 'DOUBLE', isOccupied: false, currentBooking: null },
          { id: '2', name: 'Suite 201', type: 'SUITE', isOccupied: false, currentBooking: null },
          { id: '3', name: 'Chambre 102', type: 'SINGLE', isOccupied: false, currentBooking: null },
          { id: '4', name: 'Chambre 103', type: 'DOUBLE', isOccupied: false, currentBooking: null },
          { id: '5', name: 'Suite 202', type: 'SUITE', isOccupied: false, currentBooking: null }
        ],
        activeBookings: [],
        todayBookings: [],
        expiredBookings: [],
        alerts: [],
        hourlyRates: {
          'SINGLE': 15,
          'DOUBLE': 20,
          'SUITE': 35,
          'FAMILY': 25,
          'DELUXE': 45
        }
      },
      fallback: true,
      error: error.message,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  }
});

// POST /api/manager/booking/hourly - Réservation horaire (placeholder)
router.post('/booking/hourly', managerAuth, async (req, res) => {
  try {
    const { error } = hourlyBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Pour l'instant, juste une réponse de test
    res.json({
      success: true,
      message: 'Fonctionnalité réservation horaire en développement',
      data: req.body,
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

// GET /api/manager/reports/daily - Rapport journalier (placeholder)
router.get('/reports/daily', managerAuth, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    res.json({
      success: true,
      report: {
        date,
        bookings: [],
        summary: {
          totalBookings: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
          byType: {},
          byPaymentMethod: {}
        }
      },
      message: 'Rapport journalier en développement',
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

console.log('✅ Routes espace gérant chargées [msylla01] - 2025-10-04 01:27:33');

module.exports = router;
