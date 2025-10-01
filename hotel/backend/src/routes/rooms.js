const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/rooms - Lister toutes les chambres (public)
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        reviews: {
          select: { rating: true },
          where: { isApproved: true }
        },
        _count: {
          select: { 
            bookings: {
              where: { status: { in: ['CONFIRMED', 'CHECKED_OUT'] } }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculer les statistiques pour chaque chambre
    const roomsWithStats = rooms.map(room => {
      const averageRating = room.reviews.length > 0 
        ? room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length
        : 0;

      return {
        ...room,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: room.reviews.length,
        totalBookings: room._count.bookings,
        reviews: undefined, // Supprimer les détails des reviews
        _count: undefined
      };
    });

    res.json({
      success: true,
      rooms: roomsWithStats,
      total: roomsWithStats.length,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur liste chambres [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des chambres',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rooms/:id - Détails d'une chambre (public)
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findFirst({
      where: { id: req.params.id, isActive: true },
      include: {
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { firstName: true, lastName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Calculer les statistiques
    const averageRating = room.reviews.length > 0 
      ? room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length
      : 0;

    const roomWithStats = {
      ...room,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: room.reviews.length
    };

    res.json({
      success: true,
      room: roomWithStats,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur détails chambre [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
