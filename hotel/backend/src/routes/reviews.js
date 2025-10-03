const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('⭐ Chargement routes reviews [msylla01] - 2025-10-03 16:02:30');

// Schema de validation pour création d'avis
const createReviewSchema = Joi.object({
  roomId: Joi.string().required(),
  bookingId: Joi.string().optional().allow(null),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().min(5).max(100).optional().allow(null),
  comment: Joi.string().min(10).max(1000).optional().allow(null),
  pros: Joi.array().items(Joi.string().max(100)).optional(),
  cons: Joi.array().items(Joi.string().max(100)).optional(),
  recommendToFriends: Joi.boolean().optional().allow(null)
});

// Schema de validation pour mise à jour d'avis
const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  title: Joi.string().min(5).max(100).optional().allow(null),
  comment: Joi.string().min(10).max(1000).optional().allow(null),
  pros: Joi.array().items(Joi.string().max(100)).optional(),
  cons: Joi.array().items(Joi.string().max(100)).optional(),
  recommendToFriends: Joi.boolean().optional().allow(null)
});

// GET /api/reviews - Récupérer tous les avis avec filtres
router.get('/', async (req, res) => {
  try {
    console.log('📊 Récupération avis [msylla01] - 2025-10-03 16:02:30');
    
    const { 
      roomId, 
      userId, 
      rating, 
      verified, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const where = {};
    
    if (roomId) where.roomId = roomId;
    if (userId) where.userId = userId;
    if (rating) where.rating = parseInt(rating);
    if (verified !== undefined) where.verified = verified === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              createdAt: true
            }
          },
          room: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          booking: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true
            }
          }
        },
        orderBy: {
          [sortBy]: order
        },
        take: parseInt(limit),
        skip: offset
      }),
      prisma.review.count({ where })
    ]);

    // Calculer les statistiques
    const stats = await prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { id: true }
    });

    const verifiedCount = await prisma.review.count({
      where: { ...where, verified: true }
    });

    // Distribution des notes
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: { rating: true },
      orderBy: { rating: 'desc' }
    });

    console.log(`✅ ${reviews.length} avis récupérés [msylla01]`);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      },
      stats: {
        averageRating: stats._avg.rating ? parseFloat(stats._avg.rating).toFixed(1) : '0.0',
        totalReviews: stats._count.id,
        verifiedReviews: verifiedCount,
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: item._count.rating
        }))
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération avis [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/reviews - Créer un nouvel avis
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('✍️ Création avis [msylla01] - 2025-10-03 16:02:30:', {
      userId,
      roomId: req.body.roomId,
      rating: req.body.rating,
      title: req.body.title?.substring(0, 50)
    });

    // Validation des données
    const { error } = createReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { roomId, bookingId, rating, title, comment, pros, cons, recommendToFriends } = req.body;

    // Vérifier que la chambre existe
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chambre non trouvée',
        field: 'roomId',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si avis vérifié via réservation
    let verified = false;
    let booking = null;

    if (bookingId) {
      booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId,
          roomId,
          status: { in: ['COMPLETED', 'CHECKED_OUT'] }
        }
      });

      if (booking) {
        verified = true;
        
        // Vérifier qu'il n'y a pas déjà un avis pour cette réservation
        const existingReview = await prisma.review.findFirst({
          where: { bookingId }
        });

        if (existingReview) {
          return res.status(400).json({
            success: false,
            message: 'Vous avez déjà laissé un avis pour cette réservation',
            field: 'bookingId',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Vérifier qu'un utilisateur ne peut pas laisser plusieurs avis pour la même chambre
    // (sauf s'il a plusieurs réservations)
    if (!bookingId) {
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          roomId,
          bookingId: null
        }
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà laissé un avis pour cette chambre',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        userId,
        roomId,
        bookingId: bookingId || null,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        pros: pros || [],
        cons: cons || [],
        recommendToFriends: recommendToFriends || null,
        verified,
        helpful: 0,
        isApproved: true // Auto-approuver pour l'instant
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    console.log('✅ Avis créé avec succès [msylla01]:', review.id);

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      review,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur création avis [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/reviews/room/:roomId/stats - Statistiques d'une chambre
router.get('/room/:roomId/stats', async (req, res) => {
  try {
    const { roomId } = req.params;

    const [stats, ratingDistribution, recentReviews] = await Promise.all([
      prisma.review.aggregate({
        where: { roomId, isApproved: true },
        _avg: { rating: true },
        _count: { id: true }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { roomId, isApproved: true },
        _count: { rating: true },
        orderBy: { rating: 'desc' }
      }),
      prisma.review.findMany({
        where: { roomId, isApproved: true },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      })
    ]);

    const verifiedCount = await prisma.review.count({
      where: { roomId, verified: true, isApproved: true }
    });

    res.json({
      success: true,
      stats: {
        averageRating: stats._avg.rating ? parseFloat(stats._avg.rating).toFixed(1) : '0.0',
        totalReviews: stats._count.id,
        verifiedReviews: verifiedCount,
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: item._count.rating
        })),
        recentReviews
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur stats chambre [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/reviews/:id/helpful - Marquer un avis comme utile
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Empêcher de voter pour son propre avis
    if (review.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas voter pour votre propre avis',
        timestamp: new Date().toISOString()
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        helpful: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Avis marqué comme utile',
      helpful: updatedReview.helpful,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur vote utile [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du vote',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/reviews/user/mine - Mes avis
router.get('/user/mine', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      reviews,
      total: reviews.length,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur mes avis [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos avis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/reviews/:id - Modifier un avis (utilisateur propriétaire)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation des données
    const { error } = updateReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const review = await prisma.review.findFirst({
      where: { 
        id, 
        userId 
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé ou vous n\'êtes pas autorisé à le modifier',
        timestamp: new Date().toISOString()
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    console.log('✅ Avis modifié [msylla01]:', id);

    res.json({
      success: true,
      message: 'Avis modifié avec succès',
      review: updatedReview,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur modification avis [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'avis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/reviews/:id - Supprimer un avis
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const whereClause = isAdmin ? { id } : { id, userId };
    
    const review = await prisma.review.findFirst({
      where: whereClause
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé ou vous n\'êtes pas autorisé à le supprimer',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.review.delete({
      where: { id }
    });

    console.log('✅ Avis supprimé [msylla01]:', id);

    res.json({
      success: true,
      message: 'Avis supprimé avec succès',
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur suppression avis [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/reviews/:id/response - Répondre à un avis (admin)
router.post('/:id/response', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // Vérifier les droits admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Droits administrateur requis',
        timestamp: new Date().toISOString()
      });
    }

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La réponse ne peut pas être vide',
        field: 'response',
        timestamp: new Date().toISOString()
      });
    }

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        response: response.trim(),
        responseDate: new Date(),
        responseBy: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('✅ Réponse admin ajoutée [msylla01]:', id);

    res.json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      review: updatedReview,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur réponse admin [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la réponse',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

console.log('✅ Routes reviews chargées [msylla01] - 2025-10-03 16:02:30');

module.exports = router;
