const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/rooms - Liste toutes les chambres (public)
router.get('/', async (req, res) => {
  try {
    console.log('🏨 Récupération liste chambres [msylla01] - 2025-10-02 00:09:18');

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

    // Calculer la note moyenne pour chaque chambre
    const roomsWithRating = rooms.map(room => {
      const reviews = room.reviews;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 4.5; // Note par défaut
      
      return {
        ...room,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: room._count.reviews,
        reviews: undefined, // Supprimer les reviews détaillées de la liste
        _count: undefined
      };
    });

    console.log(`✅ ${roomsWithRating.length} chambres récupérées [msylla01]`);

    res.json({
      success: true,
      rooms: roomsWithRating,
      total: roomsWithRating.length,
      filters: { type, minPrice, maxPrice, capacity, available },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération chambres [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chambres',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rooms/:id - Détails d'une chambre (public) - CORRIGÉ
router.get('/:id', async (req, res) => {
  try {
    console.log('🏨 Récupération détail chambre [msylla01] - 2025-10-02 00:09:18:', req.params.id);

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
                // Suppression du champ avatar qui n'existe pas
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

    // Calculer la note moyenne
    const reviews = room.reviews;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 4.5;

    // Vérifier la disponibilité (simulation)
    const isAvailable = true; // À implémenter avec logique de réservation

    const roomWithRating = {
      ...room,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: room._count.reviews,
      available: isAvailable,
      _count: undefined
    };

    console.log('✅ Détail chambre récupéré [msylla01]:', room.name);

    res.json({
      success: true,
      room: roomWithRating,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération détail chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la chambre',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
