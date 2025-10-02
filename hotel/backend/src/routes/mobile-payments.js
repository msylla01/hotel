const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireActiveAccount, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('📱 Routes paiement mobile [msylla01] - 2025-10-02 01:26:51');

// Schema de validation pour paiement mobile
const mobilePaymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  phoneNumber: Joi.string().required().pattern(/^(\+221|00221)?[76][0-9]{8}$/),
  operator: Joi.string().valid('ORANGE', 'WAVE', 'FREE').required(),
  amount: Joi.number().positive().required()
});

// POST /api/mobile-payments/initiate - Initier un paiement mobile
router.post('/initiate', authenticateToken, requireActiveAccount, async (req, res) => {
  try {
    console.log('📱 INITIATION paiement mobile [msylla01] - 2025-10-02 01:26:51');
    console.log('User:', req.user.id, req.user.email);
    console.log('Body:', req.body);

    // Validation
    const { error } = mobilePaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { bookingId, phoneNumber, operator, amount } = req.body;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.id
      },
      include: {
        room: {
          select: {
            name: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    if (booking.totalAmount !== amount) {
      return res.status(400).json({
        success: false,
        message: 'Le montant ne correspond pas au total de la réservation',
        expected: booking.totalAmount,
        provided: amount,
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'y a pas déjà un paiement en cours
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Un paiement est déjà en cours pour cette réservation',
        timestamp: new Date().toISOString()
      });
    }

    // Créer la transaction de paiement mobile
    const transactionId = `MP_${operator}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: 'XOF', // Franc CFA
        method: 'MOBILE_MONEY',
        status: 'PENDING',
        transactionId,
        phoneNumber,
        provider: operator,
        adminNotes: `Paiement ${operator} initié par ${req.user.firstName} ${req.user.lastName} - Numéro: ${phoneNumber}`
      },
      include: {
        booking: {
          include: {
            room: {
              select: {
                name: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Paiement mobile initié [msylla01]:', payment.id, transactionId);

    res.status(201).json({
      success: true,
      message: 'Paiement mobile initié avec succès',
      payment: {
        id: payment.id,
        transactionId,
        amount,
        currency: 'XOF',
        operator,
        phoneNumber,
        status: 'PENDING',
        instructions: {
          fr: `Composez *144*4*4*${phoneNumber}*${amount}# pour ${operator}`,
          details: {
            ORANGE: `Orange Money: *144*4*4*${phoneNumber}*${amount}#`,
            WAVE: `Wave: Envoyez ${amount} XOF au ${phoneNumber}`,
            FREE: `Free Money: *144*5*${phoneNumber}*${amount}#`
          }[operator]
        }
      },
      booking: {
        id: booking.id,
        roomName: booking.room.name,
        totalAmount: booking.totalAmount
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur initiation paiement mobile [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initiation du paiement mobile',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/mobile-payments/:transactionId/status - Vérifier le statut d'un paiement
router.get('/:transactionId/status', authenticateToken, async (req, res) => {
  try {
    console.log('📱 Vérification statut paiement [msylla01]:', req.params.transactionId);

    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: req.params.transactionId,
        booking: {
          userId: req.user.id
        }
      },
      include: {
        booking: {
          include: {
            room: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        phoneNumber: payment.phoneNumber,
        provider: payment.provider,
        adminNotes: payment.adminNotes,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      },
      booking: {
        id: payment.booking.id,
        status: payment.booking.status,
        roomName: payment.booking.room.name
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut paiement [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/mobile-payments/admin/pending - Liste des paiements en attente (ADMIN)
router.get('/admin/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('👨‍💼 GET paiements en attente ADMIN [msylla01] - 2025-10-02 01:26:51');

    const pendingPayments = await prisma.payment.findMany({
      where: {
        method: 'MOBILE_MONEY',
        status: 'PENDING'
      },
      include: {
        booking: {
          include: {
            room: {
              select: {
                name: true,
                type: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ ${pendingPayments.length} paiements en attente [msylla01]`);

    res.json({
      success: true,
      payments: pendingPayments,
      total: pendingPayments.length,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur GET paiements en attente ADMIN [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements en attente',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/mobile-payments/admin/:paymentId/confirm - Confirmer un paiement (ADMIN)
router.put('/admin/:paymentId/confirm', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('✅ CONFIRMATION paiement ADMIN [msylla01] - 2025-10-02 01:26:51:', req.params.paymentId);

    const { adminNotes, confirmationCode } = req.body;

    // Récupérer le paiement
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.paymentId },
      include: {
        booking: {
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
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Ce paiement n\'est plus en attente',
        currentStatus: payment.status,
        timestamp: new Date().toISOString()
      });
    }

    // Confirmer le paiement et la réservation
    await prisma.$transaction(async (tx) => {
      // Mettre à jour le paiement
      await tx.payment.update({
        where: { id: req.params.paymentId },
        data: {
          status: 'COMPLETED',
          adminNotes: `${payment.adminNotes}\n\n[CONFIRMÉ] Par admin ${req.user.firstName} ${req.user.lastName} le ${new Date().toLocaleString()}\nCode: ${confirmationCode || 'N/A'}\nNotes: ${adminNotes || 'Aucune'}`,
          updatedAt: new Date()
        }
      });

      // Mettre à jour la réservation
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED'
        }
      });
    });

    console.log('✅ Paiement confirmé par admin [msylla01]:', payment.id);

    res.json({
      success: true,
      message: 'Paiement confirmé avec succès',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: 'COMPLETED',
        confirmedBy: `${req.user.firstName} ${req.user.lastName}`,
        confirmedAt: new Date().toISOString()
      },
      booking: {
        id: payment.booking.id,
        status: 'CONFIRMED',
        customerName: `${payment.booking.user.firstName} ${payment.booking.user.lastName}`,
        roomName: payment.booking.room.name
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur confirmation paiement ADMIN [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/mobile-payments/admin/:paymentId/reject - Rejeter un paiement (ADMIN)
router.put('/admin/:paymentId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('❌ REJET paiement ADMIN [msylla01] - 2025-10-02 01:26:51:', req.params.paymentId);

    const { reason } = req.body;

    const payment = await prisma.payment.update({
      where: { id: req.params.paymentId },
      data: {
        status: 'FAILED',
        adminNotes: `[REJETÉ] Par admin ${req.user.firstName} ${req.user.lastName} le ${new Date().toLocaleString()}\nRaison: ${reason || 'Non spécifiée'}`,
        updatedAt: new Date()
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            room: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log('❌ Paiement rejeté par admin [msylla01]:', payment.id);

    res.json({
      success: true,
      message: 'Paiement rejeté',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        status: 'FAILED',
        rejectedBy: `${req.user.firstName} ${req.user.lastName}`,
        rejectedAt: new Date().toISOString(),
        reason
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur rejet paiement ADMIN [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet du paiement',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
