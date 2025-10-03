const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('👑 Chargement routes admin [msylla01] - 2025-10-03 17:36:40');

// Middleware pour vérifier les droits admin
const adminAuth = async (req, res, next) => {
  try {
    // Utiliser le middleware d'auth existant
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

// GET /api/admin/dashboard - Données complètes du dashboard
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    console.log('📊 Récupération données dashboard admin [msylla01] - 2025-10-03 17:36:40');

    // Récupérer toutes les données en parallèle
    const [
      users,
      rooms,
      bookings,
      reviews,
      usersStats,
      bookingsStats,
      reviewsStats,
      paymentsStats
    ] = await Promise.all([
      // Utilisateurs
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Chambres avec relations
      prisma.room.findMany({
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              createdAt: true
            }
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              verified: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Réservations avec relations
      prisma.booking.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          room: {
            select: {
              name: true,
              type: true,
              price: true
            }
          },
          payment: {
            select: {
              status: true,
              amount: true,
              method: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Avis avec relations
      prisma.review.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          room: {
            select: {
              name: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Stats utilisateurs
      prisma.user.groupBy({
        by: ['role', 'isActive'],
        _count: true
      }),

      // Stats réservations
      prisma.booking.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          totalAmount: true
        }
      }),

      // Stats avis
      prisma.review.aggregate({
        _count: true,
        _avg: {
          rating: true
        }
      }),

      // Stats paiements (si existe)
      prisma.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          amount: true
        }
      }).catch(() => [])
    ]);

    // Calculer les métriques avancées
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenus ce mois
    const thisMonthBookings = bookings.filter(b => 
      new Date(b.createdAt) >= thisMonth && 
      ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status)
    );
    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

    // Revenus mois dernier
    const lastMonthBookings = bookings.filter(b => 
      new Date(b.createdAt) >= lastMonth && 
      new Date(b.createdAt) < thisMonth &&
      ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status)
    );
    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

    // Croissance
    const revenueGrowth = lastMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 100;

    // Nouveaux utilisateurs ce mois
    const newUsersThisMonth = users.filter(u => new Date(u.createdAt) >= thisMonth).length;
    const newUsersLastMonth = users.filter(u => 
      new Date(u.createdAt) >= lastMonth && new Date(u.createdAt) < thisMonth
    ).length;
    const usersGrowth = newUsersLastMonth > 0 
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : 100;

    // Taux d'occupation
    const totalRoomNights = rooms.length * 30; // Approximation
    const bookedNights = bookings.filter(b => 
      ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(b.status)
    ).length * 2; // Approximation
    const occupancyRate = Math.round((bookedNights / totalRoomNights) * 100);

    // Préparer les données de réponse
    const dashboardData = {
      // Métriques principales
      metrics: {
        totalRevenue: thisMonthRevenue,
        revenueGrowth: revenueGrowth,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        usersGrowth: usersGrowth,
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => ['CONFIRMED', 'CHECKED_IN'].includes(b.status)).length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
        totalRooms: rooms.length,
        activeRooms: rooms.filter(r => r.isActive).length,
        occupancyRate: occupancyRate,
        totalReviews: reviews.length,
        averageRating: reviewsStats._avg.rating ? Number(reviewsStats._avg.rating).toFixed(1) : '0.0',
        verifiedReviews: reviews.filter(r => r.verified).length
      },

      // Données détaillées
      recentUsers: users.slice(0, 10),
      recentBookings: bookings.slice(0, 10),
      recentReviews: reviews.slice(0, 10),
      
      // Chambres avec stats calculées
      roomsWithStats: rooms.map(room => ({
        ...room,
        totalBookings: room.bookings.length,
        totalRevenue: room.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
        averageRating: room.reviews.length > 0 
          ? (room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length).toFixed(1)
          : '0.0',
        totalReviews: room.reviews.length,
        verifiedReviews: room.reviews.filter(r => r.verified).length
      })),

      // Statistiques par catégorie
      stats: {
        users: usersStats,
        bookings: bookingsStats,
        reviews: {
          total: reviewsStats._count,
          average: reviewsStats._avg.rating,
          distribution: await prisma.review.groupBy({
            by: ['rating'],
            _count: true,
            orderBy: { rating: 'desc' }
          })
        },
        payments: paymentsStats
      },

      // Activité récente (chronologique)
      recentActivity: [
        ...reviews.slice(0, 3).map(r => ({
          type: 'review',
          message: `Nouvel avis ${r.rating} étoiles de ${r.user.firstName} ${r.user.lastName}`,
          time: getTimeAgo(r.createdAt),
          color: 'bg-yellow-500',
          data: r
        })),
        ...bookings.slice(0, 3).map(b => ({
          type: 'booking',
          message: `Nouvelle réservation ${b.room.name} par ${b.user.firstName} ${b.user.lastName}`,
          time: getTimeAgo(b.createdAt),
          color: 'bg-blue-500',
          data: b
        })),
        ...users.slice(0, 2).map(u => ({
          type: 'user',
          message: `Nouvel utilisateur: ${u.firstName} ${u.lastName}`,
          time: getTimeAgo(u.createdAt),
          color: 'bg-green-500',
          data: u
        }))
      ].sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt)).slice(0, 8)
    };

    console.log(`✅ Dashboard admin chargé: ${users.length} users, ${rooms.length} rooms, ${bookings.length} bookings, ${reviews.length} reviews [msylla01]`);

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur dashboard admin [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données admin',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/users - Gestion utilisateurs
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              totalAmount: true
            }
          },
          reviews: {
            select: {
              id: true,
              rating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        totalBookings: user.bookings.length,
        totalSpent: user.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
        totalReviews: user.reviews.length,
        averageRating: user.reviews.length > 0 
          ? (user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length).toFixed(1)
          : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur admin users [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

// GET /api/admin/bookings - Gestion réservations
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, roomId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (roomId) where.roomId = roomId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          room: {
            select: {
              name: true,
              type: true,
              price: true
            }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur admin bookings [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
});

// PUT /api/admin/bookings/:id/status - Modifier statut réservation
router.put('/bookings/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        room: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`✅ Statut réservation modifié [msylla01]: ${id} -> ${status}`);

    res.json({
      success: true,
      message: 'Statut de réservation modifié avec succès',
      booking,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur modification statut booking [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut',
      error: error.message
    });
  }
});

// PUT /api/admin/users/:id/status - Activer/désactiver utilisateur
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Le statut isActive doit être un booléen'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true
      }
    });

    console.log(`✅ Statut utilisateur modifié [msylla01]: ${user.email} -> ${isActive ? 'actif' : 'inactif'}`);

    res.json({
      success: true,
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      user,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur modification statut user [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut utilisateur',
      error: error.message
    });
  }
});

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}j`;
}

console.log('✅ Routes admin chargées [msylla01] - 2025-10-03 17:36:40');

module.exports = router;

// GET /api/admin/users/:id - Détails d'un utilisateur spécifique (admin)
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`👤 Récupération détails utilisateur [msylla01] - 2025-10-03 19:13:54: ${id}`);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            room: {
              select: {
                name: true,
                type: true,
                price: true
              }
            },
            payment: {
              select: {
                status: true,
                amount: true,
                method: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        reviews: {
          include: {
            room: {
              select: {
                name: true,
                type: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Calculer les statistiques de l'utilisateur
    const userStats = {
      totalBookings: user.bookings.length,
      completedBookings: user.bookings.filter(b => ['COMPLETED', 'CHECKED_OUT'].includes(b.status)).length,
      cancelledBookings: user.bookings.filter(b => b.status === 'CANCELLED').length,
      totalSpent: user.bookings
        .filter(b => ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status))
        .reduce((sum, b) => sum + Number(b.totalAmount), 0),
      totalReviews: user.reviews.length,
      averageRating: user.reviews.length > 0 
        ? (user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length).toFixed(1)
        : '0.0',
      verifiedReviews: user.reviews.filter(r => r.verified).length,
      lastBooking: user.bookings.length > 0 ? user.bookings[0].createdAt : null,
      lastReview: user.reviews.length > 0 ? user.reviews[0].createdAt : null
    };

    // Masquer les informations sensibles
    const { password, ...userWithoutPassword } = user;

    const userWithStats = {
      ...userWithoutPassword,
      stats: userStats
    };

    console.log(`✅ Détails utilisateur récupérés [msylla01]: ${user.firstName} ${user.lastName}`);

    res.json({
      success: true,
      user: userWithStats,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération détails utilisateur [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails utilisateur',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/revenue - Statistiques de revenus détaillées (admin)
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    console.log('💰 Récupération données revenus [msylla01] - 2025-10-03 19:38:06');

    const { period = 'month', year = new Date().getFullYear() } = req.query;

    // Calculer les dates de début et fin selon la période
    const currentDate = new Date();
    const currentYear = parseInt(year);
    
    let startDate, endDate;
    
    if (period === 'year') {
      startDate = new Date(currentYear, 0, 1); // 1er janvier
      endDate = new Date(currentYear, 11, 31, 23, 59, 59); // 31 décembre
    } else if (period === 'month') {
      startDate = new Date(currentYear, currentDate.getMonth(), 1); // 1er du mois
      endDate = new Date(currentYear, currentDate.getMonth() + 1, 0, 23, 59, 59); // Dernier jour du mois
    } else if (period === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      startDate = startOfWeek;
      endDate = endOfWeek;
    } else {
      // Par défaut: mois actuel
      startDate = new Date(currentYear, currentDate.getMonth(), 1);
      endDate = new Date(currentYear, currentDate.getMonth() + 1, 0, 23, 59, 59);
    }

    // Récupérer toutes les données nécessaires
    const [
      allBookings,
      allPayments,
      rooms,
      users,
      reviews,
      periodBookings,
      periodPayments
    ] = await Promise.all([
      // Toutes les réservations
      prisma.booking.findMany({
        include: {
          room: {
            select: { name: true, type: true, price: true }
          },
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Tous les paiements
      prisma.payment.findMany({
        include: {
          booking: {
            include: {
              room: { select: { name: true, type: true } },
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Chambres
      prisma.room.findMany(),

      // Utilisateurs
      prisma.user.findMany({
        select: { id: true, role: true, createdAt: true }
      }),

      // Avis
      prisma.review.findMany({
        select: { rating: true, createdAt: true, roomId: true }
      }),

      // Réservations de la période
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          room: { select: { name: true, type: true } },
          payment: true
        }
      }),

      // Paiements de la période
      prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          booking: {
            include: {
              room: { select: { name: true, type: true } }
            }
          }
        }
      })
    ]);

    // Calculer les revenus par statut
    const calculateRevenue = (bookings, status = null) => {
      const filteredBookings = status 
        ? bookings.filter(b => b.status === status)
        : bookings.filter(b => ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status));
      
      return filteredBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    };

    // Revenus totaux (historique)
    const totalRevenue = calculateRevenue(allBookings);
    const totalRevenueConfirmed = calculateRevenue(allBookings, 'CONFIRMED');
    const totalRevenueCompleted = calculateRevenue(allBookings, 'COMPLETED');
    const totalRevenuePending = allBookings
      .filter(b => b.status === 'PENDING')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);

    // Revenus de la période
    const periodRevenue = calculateRevenue(periodBookings);
    const periodRevenueConfirmed = calculateRevenue(periodBookings, 'CONFIRMED');
    const periodRevenueCompleted = calculateRevenue(periodBookings, 'COMPLETED');

    // Revenus par type de chambre
    const revenueByRoomType = {};
    allBookings.forEach(booking => {
      if (['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(booking.status)) {
        const type = booking.room.type;
        revenueByRoomType[type] = (revenueByRoomType[type] || 0) + Number(booking.totalAmount);
      }
    });

    // Revenus par chambre (top 10)
    const revenueByRoom = {};
    allBookings.forEach(booking => {
      if (['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(booking.status)) {
        const roomName = booking.room.name;
        revenueByRoom[roomName] = (revenueByRoom[roomName] || 0) + Number(booking.totalAmount);
      }
    });

    const topRooms = Object.entries(revenueByRoom)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Analyse des paiements
    const paymentStats = {
      total: allPayments.length,
      completed: allPayments.filter(p => p.status === 'COMPLETED').length,
      pending: allPayments.filter(p => p.status === 'PENDING').length,
      failed: allPayments.filter(p => p.status === 'FAILED').length,
      byMethod: {}
    };

    // Revenus par méthode de paiement
    allPayments.forEach(payment => {
      if (payment.status === 'COMPLETED') {
        const method = payment.method;
        paymentStats.byMethod[method] = (paymentStats.byMethod[method] || 0) + Number(payment.amount);
      }
    });

    // Évolution des revenus (12 derniers mois)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(monthDate.getMonth() + 1);
      
      const monthBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthDate && bookingDate < nextMonth &&
               ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(booking.status);
      });
      
      const monthRevenue = monthBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
      
      monthlyRevenue.push({
        month: monthDate.toISOString().slice(0, 7), // YYYY-MM
        monthName: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        bookings: monthBookings.length
      });
    }

    // Calcul période précédente pour comparaison
    let prevStartDate, prevEndDate;
    if (period === 'month') {
      prevStartDate = new Date(currentYear, currentDate.getMonth() - 1, 1);
      prevEndDate = new Date(currentYear, currentDate.getMonth(), 0, 23, 59, 59);
    } else if (period === 'year') {
      prevStartDate = new Date(currentYear - 1, 0, 1);
      prevEndDate = new Date(currentYear - 1, 11, 31, 23, 59, 59);
    } else {
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 7);
      prevEndDate = new Date(endDate);
      prevEndDate.setDate(endDate.getDate() - 7);
    }

    const prevPeriodBookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= prevStartDate && bookingDate <= prevEndDate;
    });

    const prevPeriodRevenue = calculateRevenue(prevPeriodBookings);
    const revenueGrowth = prevPeriodRevenue > 0 
      ? Math.round(((periodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100)
      : 100;

    // Métriques avancées
    const averageOrderValue = periodBookings.length > 0 
      ? periodRevenue / periodBookings.length 
      : 0;

    const conversionRate = users.length > 0 
      ? Math.round((periodBookings.length / users.length) * 100)
      : 0;

    // Préparer la réponse
    const revenueData = {
      period: {
        type: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        label: period === 'month' ? 'Ce mois' : 
               period === 'year' ? 'Cette année' : 
               'Cette semaine'
      },

      summary: {
        totalRevenue,
        periodRevenue,
        revenueGrowth,
        averageOrderValue,
        conversionRate,
        totalBookings: allBookings.length,
        periodBookings: periodBookings.length,
        totalRooms: rooms.length,
        totalUsers: users.length
      },

      breakdown: {
        confirmed: periodRevenueConfirmed,
        completed: periodRevenueCompleted,
        pending: totalRevenuePending,
        byRoomType: revenueByRoomType,
        topRooms
      },

      payments: paymentStats,

      trends: {
        monthly: monthlyRevenue,
        growth: revenueGrowth,
        previousPeriod: prevPeriodRevenue
      },

      recentTransactions: allPayments
        .filter(p => p.status === 'COMPLETED')
        .slice(0, 10)
        .map(payment => ({
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          date: payment.createdAt,
          booking: {
            id: payment.booking.id,
            room: payment.booking.room.name,
            user: `${payment.booking.user.firstName} ${payment.booking.user.lastName}`
          }
        }))
    };

    console.log(`✅ Données revenus calculées [msylla01]: ${formatCurrency(periodRevenue)} (${period})`);

    res.json({
      success: true,
      data: revenueData,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération revenus [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données de revenus',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Fonction utilitaire pour formater la monnaie
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
