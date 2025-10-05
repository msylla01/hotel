const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { managerAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🏨 Routes espace gérant avec marge 10min [msylla01] - 2025-10-04 02:57:35');

// GET /api/manager/dashboard - Dashboard avec gestion marge 10 minutes
router.get('/dashboard', managerAuth, async (req, res) => {
  try {
    console.log('📊 Dashboard gérant avec marge 10min [msylla01]');
    console.log('👤 Utilisateur connecté:', req.user?.email, 'Role:', req.user?.role);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Récupérer les chambres avec leurs réservations actives et type climatisation
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
            clientLastName: true,
            status: true
          }
        }
      }
    }).catch(error => {
      console.log('⚠️ Erreur Prisma, utilisation fallback:', error.message);
      return prisma.room.findMany({ where: { isActive: true } });
    });

    console.log('🏨 Chambres récupérées:', rooms.length);

    // Calculer disponibilité avec marge de 10 minutes
    const roomsAvailability = rooms.map(room => {
      let isOccupied = false;
      let currentBooking = null;
      let availableAt = null;
      let timeUntilAvailable = null;

      if (room.managerBookings && room.managerBookings.length > 0) {
        const booking = room.managerBookings[0];
        const checkOutTime = new Date(booking.checkOut);
        
        // Ajouter marge de 10 minutes après l'heure de sortie
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
        climateType: room.climateType || 'VENTILE', // Fallback si pas encore migré
        managerBookings: room.managerBookings || []
      };
    });

    // Statistiques
    const stats = {
      totalRooms: rooms.length,
      occupiedRooms: roomsAvailability.filter(r => r.isOccupied).length,
      availableRooms: roomsAvailability.filter(r => !r.isOccupied).length,
      activeBookings: roomsAvailability.filter(r => r.isOccupied).length,
      roomsInCleaningBuffer: roomsAvailability.filter(r => 
        r.timeUntilAvailable !== null && r.timeUntilAvailable <= 10 && r.timeUntilAvailable > 0
      ).length,
      expiredBookings: 0,
      todayBookings: 0,
      todayRevenue: 0,
      occupancyRate: rooms.length > 0 ? Math.round((roomsAvailability.filter(r => r.isOccupied).length / rooms.length) * 100) : 0
    };

    // Tarifs horaires par type de chambre ET climatisation
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

    console.log('📊 Stats avec marge 10min:', stats);

    res.json({
      success: true,
      data: {
        stats,
        rooms: roomsAvailability,
        activeBookings: [],
        todayBookings: [],
        expiredBookings: [],
        alerts: [],
        hourlyRates,
        cleaningMargin: 10 // 10 minutes de marge
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur dashboard gérant [msylla01]:', error);
    
    // Fallback data avec climatisation
    res.json({
      success: true,
      data: {
        stats: {
          totalRooms: 5,
          occupiedRooms: 0,
          availableRooms: 5,
          activeBookings: 0,
          roomsInCleaningBuffer: 0,
          expiredBookings: 0,
          todayBookings: 0,
          todayRevenue: 0,
          occupancyRate: 0
        },
        rooms: [
          { id: '1', name: 'CH1 - Chambre 101', type: 'DOUBLE', climateType: 'VENTILE', isOccupied: false, currentBooking: null },
          { id: '2', name: 'CH2 - Suite 201', type: 'SUITE', climateType: 'CLIMATISE', isOccupied: false, currentBooking: null },
          { id: '3', name: 'CH3 - Chambre 102', type: 'SINGLE', climateType: 'VENTILE', isOccupied: false, currentBooking: null },
          { id: '4', name: 'CH4 - Chambre 103', type: 'DOUBLE', climateType: 'CLIMATISE', isOccupied: false, currentBooking: null },
          { id: '5', name: 'CH5 - Suite 202', type: 'SUITE', climateType: 'CLIMATISE', isOccupied: false, currentBooking: null }
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

// GET /api/manager/rooms/availability - Vérifier disponibilité temps réel
router.get('/rooms/availability', managerAuth, async (req, res) => {
  try {
    const now = new Date();
    
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        managerBookings: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    const availability = rooms.map(room => {
      let status = 'AVAILABLE';
      let availableAt = null;
      let minutesUntilAvailable = 0;

      if (room.managerBookings.length > 0) {
        const booking = room.managerBookings[0];
        const checkOutTime = new Date(booking.checkOut);
        const availableTime = new Date(checkOutTime.getTime() + (10 * 60 * 1000)); // +10min

        if (now < checkOutTime) {
          status = 'OCCUPIED';
        } else if (now < availableTime) {
          status = 'CLEANING'; // En période de nettoyage/marge
          availableAt = availableTime;
          minutesUntilAvailable = Math.round((availableTime - now) / (1000 * 60));
        } else {
          status = 'AVAILABLE';
        }
      }

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        climateType: room.climateType || 'VENTILE',
        status,
        availableAt,
        minutesUntilAvailable
      };
    });

    res.json({
      success: true,
      availability,
      timestamp: now.toISOString(),
      cleaningMargin: 10
    });

  } catch (error) {
    console.error('❌ Erreur vérification disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur vérification disponibilité',
      error: error.message
    });
  }
});

console.log('✅ Routes gérant avec marge 10min prêtes [msylla01] - 2025-10-04 02:57:35');

module.exports = router;
