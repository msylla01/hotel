const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/favorites - Mes chambres favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('❤️ Récupération favoris [msylla01] - 2025-10-02 00:27:12:', req.user.id);

    // Simuler des favoris pour l'instant
    const favorites = [
      {
        id: 'fav_1',
        userId: req.user.id,
        roomId: 'room_2',
        createdAt: new Date(),
        room: {
          id: 'room_2',
          name: 'Chambre Double Prestige',
          type: 'DOUBLE',
          price: 180,
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop'],
          rating: 4.5,
          reviewCount: 128
        }
      },
      {
        id: 'fav_2',
        userId: req.user.id,
        roomId: 'room_5',
        createdAt: new Date(),
        room: {
          id: 'room_5',
          name: 'Suite Présidentielle Deluxe',
          type: 'DELUXE',
          price: 450,
          images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop'],
          rating: 4.9,
          reviewCount: 34
        }
      }
    ];

    console.log(`✅ ${favorites.length} favoris trouvés [msylla01]`);

    res.json({
      success: true,
      favorites,
      total: favorites.length,
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

// POST /api/favorites - Ajouter aux favoris
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('❤️ Ajout favori [msylla01] - 2025-10-02 00:27:12:', req.body);

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
    const mockRooms = {
      'room_1': { id: 'room_1', name: 'Chambre Simple Confort', price: 120 },
      'room_2': { id: 'room_2', name: 'Chambre Double Prestige', price: 180 },
      'room_3': { id: 'room_3', name: 'Suite Junior Executive', price: 350 },
      'room_4': { id: 'room_4', name: 'Chambre Familiale Spacieuse', price: 250 },
      'room_5': { id: 'room_5', name: 'Suite Présidentielle Deluxe', price: 450 }
    };

    const room = mockRooms[roomId];
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Simuler l'ajout
    const favorite = {
      id: 'fav_' + Date.now(),
      userId: req.user.id,
      roomId,
      createdAt: new Date(),
      room
    };

    console.log('✅ Favori ajouté [msylla01]:', favorite.id);

    res.status(201).json({
      success: true,
      message: 'Chambre ajoutée aux favoris',
      favorite,
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
    console.log('💔 Suppression favori [msylla01] - 2025-10-02 00:27:12:', req.params.roomId);

    const { roomId } = req.params;

    console.log('✅ Favori supprimé [msylla01]:', roomId);

    res.json({
      success: true,
      message: 'Chambre retirée des favoris',
      roomId,
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
