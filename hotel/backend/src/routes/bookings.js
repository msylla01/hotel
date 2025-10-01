const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/bookings - Mes réservations
router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        room: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      bookings,
      total: bookings.length,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur liste réservations [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/:id - Détails d'une réservation
router.get('/:id', async (req, res) => {
  try {
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

    res.json({
      success: true,
      booking,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur détails réservation [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
