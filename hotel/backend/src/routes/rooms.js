const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Schema de validation pour créer/modifier une chambre
const roomSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE').required(),
  price: Joi.number().positive().required(),
  description: Joi.string().max(1000).optional(),
  capacity: Joi.number().integer().min(1).max(10).required(),
  size: Joi.number().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional()
});

// GET /api/rooms - Lister toutes les chambres (public avec filtres)
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      minPrice, 
      maxPrice, 
      capacity, 
      available, 
      checkIn, 
      checkOut,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 12
    } = req.query;
    
    let where = { isActive: true };
    
    // Filtres
    if (type) where.type = type;
    if (capacity) where.capacity = { gte: parseInt(capacity) };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filtres de disponibilité
    if (available === 'true' && checkIn && checkOut) {
      where.bookings = {
        none: {
          AND: [
            { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            {
              OR: [
                {
                  AND: [
                    { checkIn: { lte: new Date(checkIn) } },
                    { checkOut: { gt: new Date(checkIn) } }
                  ]
                },
                {
                  AND: [
                    { checkIn: { lt: new Date(checkOut) } },
                    { checkOut: { gte: new Date(checkOut) } }
                  ]
                },
                {
                  AND: [
                    { checkIn: { gte: new Date(checkIn) } },
                    { checkOut: { lte: new Date(checkOut) } }
                  ]
                }
              ]
            }
          ]
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Tri
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [rooms, totalCount] = await Promise.all([
      prisma.room.findMany({
        where,
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
        orderBy,
        skip,
        take
      }),
      prisma.room.count({ where })
    ]);

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
        reviews: undefined,
        _count: undefined
      };
    });

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      success: true,
      rooms: roomsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: take
      },
      filters: { type, minPrice, maxPrice, capacity, available, checkIn, checkOut },
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

// GET /api/rooms/types - Obtenir les types de chambres disponibles
router.get('/types', async (req, res) => {
  try {
    const types = await prisma.room.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { type: true },
      _min: { price: true },
      _max: { price: true }
    });

    const typesWithInfo = types.map(type => ({
      type: type.type,
      count: type._count.type,
      priceRange: {
        min: type._min.price,
        max: type._max.price
      }
    }));

    res.json({
      success: true,
      types: typesWithInfo,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur types chambres [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des types de chambres',
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
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            checkOut: { gte: new Date() }
          },
          select: { checkIn: true, checkOut: true }
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
      totalReviews: room.reviews.length,
      upcomingBookings: room.bookings.map(booking => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
      })),
      bookings: undefined
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

// POST /api/rooms - Créer une chambre (admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = roomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const roomData = {
      ...req.body,
      price: parseFloat(req.body.price),
      capacity: parseInt(req.body.capacity),
      size: req.body.size ? parseFloat(req.body.size) : null,
      amenities: req.body.amenities || [],
      images: req.body.images || []
    };

    const room = await prisma.room.create({
      data: roomData,
      include: {
        _count: {
          select: { bookings: true, reviews: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Chambre créée avec succès',
      room: {
        ...room,
        averageRating: 0,
        totalReviews: 0,
        totalBookings: room._count.bookings
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur création chambre [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/rooms/:id - Modifier une chambre (admin seulement)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = roomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const existingRoom = await prisma.room.findUnique({
      where: { id: req.params.id }
    });

    if (!existingRoom) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    const updateData = {
      ...req.body,
      price: parseFloat(req.body.price),
      capacity: parseInt(req.body.capacity),
      size: req.body.size ? parseFloat(req.body.size) : null,
      amenities: req.body.amenities || [],
      images: req.body.images || []
    };

    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        reviews: {
          select: { rating: true },
          where: { isApproved: true }
        },
        _count: {
          select: { bookings: true, reviews: true }
        }
      }
    });

    const averageRating = room.reviews.length > 0 
      ? room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length
      : 0;

    res.json({
      success: true,
      message: 'Chambre modifiée avec succès',
      room: {
        ...room,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: room.reviews.length,
        totalBookings: room._count.bookings,
        reviews: undefined,
        _count: undefined
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur modification chambre [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la modification de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/rooms/:id - Supprimer une chambre (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const existingRoom = await prisma.room.findUnique({
      where: { id: req.params.id }
    });

    if (!existingRoom) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete - marquer comme inactive au lieu de supprimer
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Chambre supprimée avec succès',
      room,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur suppression chambre [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/rooms/:id/toggle - Activer/Désactiver une chambre (admin seulement)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id }
    });

    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Chambre non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: req.params.id },
      data: { isActive: !room.isActive }
    });

    res.json({
      success: true,
      message: `Chambre ${updatedRoom.isActive ? 'activée' : 'désactivée'} avec succès`,
      room: updatedRoom,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur toggle chambre [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la modification du statut de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
