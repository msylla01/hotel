const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('❤️ Routes favoris complètes [msylla01] - 2025-10-02 01:26:51');

// GET /api/favorites - Mes chambres favorites avec vraies données
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('❤️ Récupération favoris [msylla01] - 2025-10-02 01:26:51:', req.user.id);

    // Pour l'instant, simuler avec localStorage côté client
    // En production, créer une table favorites dans Prisma
    
    // Récupérer toutes les chambres pour permettre le filtrage côté client
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } }
          }
        }
      }
    });

    // Calculer ratings
    const roomsWithRating = rooms.map(room => {
      const reviews = room.reviews;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : null;
      
      return {
        ...room,
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: room._count.reviews,
        reviews: undefined,
        _count: undefined
      };
    });

    console.log(`✅ ${roomsWithRating.length} chambres disponibles pour favoris [msylla01]`);

    res.json({
      success: true,
      message: 'Chambres disponibles pour favoris (gestion côté client)',
      rooms: roomsWithRating,
      total: roomsWithRating.length,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération favoris [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/favorites - Ajouter aux favoris (simulation)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('❤️ Ajout favori [msylla01] - 2025-10-02 01:26:51:', req.body);

    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'ID de chambre requis',
        field: 'roomId',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que la chambre existe
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        type: true,
        price: true
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Favori validé [msylla01]:', roomId, room.name);

    res.status(201).json({
      success: true,
      message: 'Chambre ajoutée aux favoris',
      room: room,
      note: 'Favoris gérés côté client avec localStorage',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur ajout favori [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout aux favoris',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/favorites/:roomId - Retirer des favoris
router.delete('/:roomId', authenticateToken, async (req, res) => {
  try {
    console.log('💔 Suppression favori [msylla01] - 2025-10-02 01:26:51:', req.params.roomId);

    const { roomId } = req.params;

    // Vérifier que la chambre existe
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Favori supprimé [msylla01]:', roomId, room.name);

    res.json({
      success: true,
      message: 'Chambre retirée des favoris',
      roomId,
      roomName: room.name,
      note: 'Favoris gérés côté client avec localStorage',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur suppression favori [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du favori',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
