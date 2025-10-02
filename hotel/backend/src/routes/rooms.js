const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🏨 Routes rooms - VRAIES DONNÉES DB [msylla01] - 2025-10-02 00:52:45');

// GET /api/rooms - VRAIES chambres depuis DB
router.get('/', async (req, res) => {
  try {
    console.log('🏨 GET chambres DB [msylla01]');

    const { type, minPrice, maxPrice, capacity, available } = req.query;
    
    let whereClause = { isActive: true };
    
    if (type) whereClause.type = type;
    if (minPrice) whereClause.price = { ...whereClause.price, gte: parseInt(minPrice) };
    if (maxPrice) whereClause.price = { ...whereClause.price, lte: parseInt(maxPrice) };
    if (capacity) whereClause.capacity = { gte: parseInt(capacity) };

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer rating moyen depuis vraies reviews
    const roomsWithRating = rooms.map(room => {
      const reviews = room.reviews;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      return {
        ...room,
        rating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: room._count.reviews,
        reviews: undefined,
        _count: undefined
      };
    });

    console.log(`✅ ${roomsWithRating.length} chambres DB récupérées [msylla01]`);

    res.json({
      success: true,
      rooms: roomsWithRating,
      total: roomsWithRating.length,
      filters: { type, minPrice, maxPrice, capacity, available },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur GET chambres DB [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chambres',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rooms/:id - VRAIE chambre depuis DB
router.get('/:id', async (req, res) => {
  try {
    console.log('🏨 GET chambre détail DB [msylla01]:', req.params.id);

    const room = await prisma.room.findFirst({
      where: {
        id: req.params.id,
        isActive: true
      },
      include: {
        reviews: {
          where: {
            isApproved: true
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                id: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            }
          }
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

    // Calculer rating depuis vraies reviews
    const reviews = room.reviews;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Vérifier disponibilité en vérifiant conflits
    const now = new Date();
    const futureBookings = await prisma.booking.count({
      where: {
        roomId: room.id,
        status: { in: ['CONFIRMED', 'PENDING'] },
        checkIn: { gte: now }
      }
    });

    const roomWithRating = {
      ...room,
      rating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: room._count.reviews,
      available: futureBookings === 0, // Disponible si pas de réservations futures
      _count: undefined
    };

    console.log('✅ Chambre DB récupérée [msylla01]:', room.name);

    res.json({
      success: true,
      room: roomWithRating,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur GET chambre détail DB [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la chambre',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
