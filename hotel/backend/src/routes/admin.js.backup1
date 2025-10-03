const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Toutes les routes admin nécessitent un accès admin
router.use(requireAdmin);

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

// GET /api/admin/dashboard - Dashboard administrateur
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      totalRevenue,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: { in: ['CONFIRMED', 'CHECKED_OUT'] } },
        _sum: { totalAmount: true }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          room: { select: { name: true, type: true } }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalRooms,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentBookings,
      occupancyRate: Math.floor(Math.random() * 30) + 70, // Simulation
      monthlyGrowth: Math.floor(Math.random() * 20) + 5 // Simulation
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
      admin: req.user,
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur dashboard admin [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/rooms - Gérer toutes les chambres (incluant inactives)
router.get('/rooms', async (req, res) => {
  try {
    const { 
      type, 
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let where = {};
    
    // Filtres
    if (type) where.type = type;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

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
              bookings: true,
              reviews: true
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
      filters: { type, status },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur liste chambres admin [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des chambres',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/admin/rooms - Créer une nouvelle chambre
router.post('/rooms', async (req, res) => {
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
      admin: req.user,
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur création chambre admin [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/admin/rooms/:id - Modifier une chambre
router.put('/rooms/:id', async (req, res) => {
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
      admin: req.user,
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur modification chambre admin [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la modification de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/admin/rooms/:id - Supprimer une chambre (soft delete)
router.delete('/rooms/:id', async (req, res) => {
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

    // Soft delete - marquer comme inactive
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Chambre supprimée avec succès',
      room,
      timestamp: new Date().toISOString(),
      admin: req.user,
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur suppression chambre admin [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/admin/rooms/:id/toggle - Activer/Désactiver une chambre
router.patch('/rooms/:id/toggle', async (req, res) => {
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
      admin: req.user,
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur toggle chambre admin [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la modification du statut de la chambre',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/users - Gérer les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const { 
      role,
      status,
      page = 1,
      limit = 20,
      search
    } = req.query;
    
    let where = {};
    
    // Filtres
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          phone: true,
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: take
      },
      filters: { role, status, search },
      timestamp: new Date().toISOString(),
      admin: req.user,
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('Erreur liste utilisateurs admin [msylla01]:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
