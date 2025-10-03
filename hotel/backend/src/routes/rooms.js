const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('🏨 Chargement routes rooms avec CRUD [msylla01] - 2025-10-03 18:25:04');

// Middleware pour vérifier les droits admin
const adminAuth = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Droits administrateur requis'
        });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentification admin échouée'
    });
  }
};

// Schema de validation pour création/modification de chambre
const roomSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).optional().allow(''),
  type: Joi.string().valid('SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE').required(),
  price: Joi.number().positive().required(),
  capacity: Joi.number().integer().min(1).max(10).required(),
  size: Joi.number().positive().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  amenities: Joi.array().items(Joi.string().max(50)).optional(),
  isActive: Joi.boolean().optional().default(true)
});

// GET /api/rooms - Récupérer toutes les chambres (public)
router.get('/', async (req, res) => {
  try {
    console.log('🏨 Récupération chambres [msylla01] - 2025-10-03 18:25:04');

    const { showInactive } = req.query;
    
    // Par défaut, ne montrer que les chambres actives aux clients
    const where = showInactive === 'true' ? {} : { isActive: true };

    const rooms = await prisma.room.findMany({
      where,
      include: {
        reviews: {
          select: {
            rating: true,
            verified: true
          }
        },
        bookings: {
          select: {
            status: true,
            totalAmount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer les stats pour chaque chambre
    const roomsWithStats = rooms.map(room => ({
      ...room,
      averageRating: room.reviews.length > 0 
        ? (room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length).toFixed(1)
        : '0.0',
      totalReviews: room.reviews.length,
      verifiedReviews: room.reviews.filter(r => r.verified).length,
      totalBookings: room.bookings.length,
      totalRevenue: room.bookings
        .filter(b => ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status))
        .reduce((sum, b) => sum + Number(b.totalAmount), 0)
    }));

    console.log(`✅ ${rooms.length} chambres récupérées [msylla01]`);

    res.json({
      success: true,
      rooms: roomsWithStats,
      total: rooms.length,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération chambres [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chambres',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/rooms/:id - Récupérer une chambre spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        bookings: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
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

    // Calculer les stats
    const roomWithStats = {
      ...room,
      averageRating: room.reviews.length > 0 
        ? (room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length).toFixed(1)
        : '0.0',
      totalReviews: room.reviews.length,
      verifiedReviews: room.reviews.filter(r => r.verified).length,
      totalBookings: room.bookings.length,
      totalRevenue: room.bookings
        .filter(b => ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status))
        .reduce((sum, b) => sum + Number(b.totalAmount), 0)
    };

    res.json({
      success: true,
      room: roomWithStats,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la chambre',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/rooms - Créer une nouvelle chambre (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('➕ Création nouvelle chambre [msylla01] - 2025-10-03 18:25:04:', req.body);

    // Validation des données
    const { error } = roomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const roomData = req.body;

    // Vérifier que le nom de chambre n'existe pas déjà
    const existingRoom = await prisma.room.findFirst({
      where: { name: roomData.name }
    });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: 'Une chambre avec ce nom existe déjà',
        field: 'name',
        timestamp: new Date().toISOString()
      });
    }

    // Créer la chambre
    const room = await prisma.room.create({
      data: {
        name: roomData.name,
        description: roomData.description || '',
        type: roomData.type,
        price: Number(roomData.price),
        capacity: Number(roomData.capacity),
        size: roomData.size ? Number(roomData.size) : null,
        images: roomData.images || [],
        amenities: roomData.amenities || [],
        isActive: roomData.isActive !== false
      }
    });

    console.log('✅ Chambre créée avec succès [msylla01]:', room.id);

    res.status(201).json({
      success: true,
      message: 'Chambre créée avec succès',
      room,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur création chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la chambre',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/rooms/:id - Modifier une chambre (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('✏️ Modification chambre [msylla01] - 2025-10-03 18:25:04:', id, req.body);

    // Validation des données
    const { error } = roomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que la chambre existe
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que le nom n'est pas déjà utilisé par une autre chambre
    if (req.body.name && req.body.name !== existingRoom.name) {
      const nameExists = await prisma.room.findFirst({
        where: { 
          name: req.body.name,
          id: { not: id }
        }
      });

      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'Une autre chambre utilise déjà ce nom',
          field: 'name',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Mettre à jour la chambre
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        name: req.body.name,
        description: req.body.description || '',
        type: req.body.type,
        price: Number(req.body.price),
        capacity: Number(req.body.capacity),
        size: req.body.size ? Number(req.body.size) : null,
        images: req.body.images || [],
        amenities: req.body.amenities || [],
        isActive: req.body.isActive !== false,
        updatedAt: new Date()
      }
    });

    console.log('✅ Chambre modifiée avec succès [msylla01]:', id);

    res.json({
      success: true,
      message: 'Chambre modifiée avec succès',
      room: updatedRoom,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur modification chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la chambre',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/rooms/:id/status - Activer/désactiver une chambre (admin)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Le statut isActive doit être un booléen',
        timestamp: new Date().toISOString()
      });
    }

    const room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Statut chambre modifié [msylla01]: ${room.name} -> ${isActive ? 'active' : 'inactive'}`);

    res.json({
      success: true,
      message: `Chambre ${isActive ? 'activée' : 'désactivée'} avec succès`,
      room: updatedRoom,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur modification statut chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/rooms/:id - Supprimer une chambre (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: true,
        reviews: true
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier s'il y a des réservations actives
    const activeBookings = room.bookings.filter(b => 
      ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(b.status)
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer la chambre : ${activeBookings.length} réservation(s) active(s)`,
        activeBookings: activeBookings.length,
        timestamp: new Date().toISOString()
      });
    }

    // Supprimer la chambre et ses données liées
    await prisma.$transaction(async (tx) => {
      // Supprimer les avis
      await tx.review.deleteMany({
        where: { roomId: id }
      });

      // Supprimer les paiements liés aux réservations
      await tx.payment.deleteMany({
        where: {
          booking: {
            roomId: id
          }
        }
      });

      // Supprimer les réservations
      await tx.booking.deleteMany({
        where: { roomId: id }
      });

      // Supprimer la chambre
      await tx.room.delete({
        where: { id }
      });
    });

    console.log('✅ Chambre supprimée avec succès [msylla01]:', room.name);

    res.json({
      success: true,
      message: 'Chambre supprimée avec succès',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur suppression chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la chambre',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

console.log('✅ Routes rooms CRUD chargées [msylla01] - 2025-10-03 18:25:04');

module.exports = router;
