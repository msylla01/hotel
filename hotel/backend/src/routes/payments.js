const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const paymentService = require('../services/paymentService');

const router = express.Router();
const prisma = new PrismaClient();

// Schema de validation pour créer un Payment Intent
const createPaymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  amount: Joi.number().positive().required()
});

// POST /api/payments/create-intent - Créer un Payment Intent
router.post('/create-intent', authenticateToken, async (req, res) => {
  try {
    const { error } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0],
        timestamp: new Date().toISOString()
      });
    }

    const { bookingId, amount } = req.body;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.id
      },
      include: {
        room: true,
        user: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que le montant correspond
    if (amount !== booking.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Le montant ne correspond pas à la réservation',
        expected: booking.totalAmount,
        received: amount,
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'y a pas déjà un paiement réussi
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        status: 'COMPLETED'
      }
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Cette réservation a déjà été payée',
        paymentId: existingPayment.id,
        timestamp: new Date().toISOString()
      });
    }

    // Créer le Payment Intent
    const paymentResult = await paymentService.createPaymentIntent(
      amount,
      'eur',
      {
        bookingId,
        userId: req.user.id,
        userEmail: req.user.email,
        roomName: booking.room.name,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString()
      }
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error,
        code: paymentResult.code,
        timestamp: new Date().toISOString()
      });
    }

    // Enregistrer le Payment Intent en base (status PENDING)
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: 'EUR',
        method: 'STRIPE',
        status: 'PENDING',
        stripeId: paymentResult.paymentIntentId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment Intent créé avec succès',
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      },
      booking: {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        room: booking.room.name
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur création Payment Intent [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/payments/confirm - Confirmer un paiement réussi
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID requis',
        timestamp: new Date().toISOString()
      });
    }

    // Confirmer le paiement avec Stripe
    const paymentResult = await paymentService.confirmPayment(paymentIntentId);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error,
        timestamp: new Date().toISOString()
      });
    }

    // Mettre à jour le paiement en base
    const payment = await prisma.payment.findFirst({
      where: { stripeId: paymentIntentId },
      include: {
        booking: {
          include: {
            room: true,
            user: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé en base',
        timestamp: new Date().toISOString()
      });
    }

    // Mettre à jour le statut selon la réponse Stripe
    const newStatus = paymentResult.status === 'succeeded' ? 'COMPLETED' : 'FAILED';
    
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: newStatus,
        transactionId: paymentResult.charges?.[0]?.id || paymentIntentId
      }
    });

    // Si paiement réussi, confirmer la réservation
    if (newStatus === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' }
      });

      console.log(`✅ Réservation confirmée [msylla01]: ${payment.bookingId}`);
    }

    res.json({
      success: true,
      message: newStatus === 'COMPLETED' ? 'Paiement confirmé avec succès' : 'Paiement échoué',
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        transactionId: updatedPayment.transactionId
      },
      booking: {
        id: payment.booking.id,
        status: newStatus === 'COMPLETED' ? 'CONFIRMED' : payment.booking.status
      },
      stripeDetails: paymentResult,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur confirmation paiement [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/payments/booking/:bookingId - Status des paiements pour une réservation
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Vérifier que la réservation appartient à l'utilisateur
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    const payments = await prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        transactionId: payment.transactionId,
        stripeId: payment.stripeId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      })),
      bookingId,
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur récupération paiements [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/payments/webhook/stripe - Webhook Stripe
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);

    if (result.success) {
      // Traiter les événements webhook si nécessaire
      if (result.event === 'payment_succeeded' && result.paymentIntentId) {
        // Mettre à jour automatiquement le statut en base
        await prisma.payment.updateMany({
          where: { stripeId: result.paymentIntentId },
          data: { status: 'COMPLETED' }
        });
        
        console.log(`🔔 Webhook: Paiement ${result.paymentIntentId} marqué comme COMPLETED [msylla01]`);
      }
      
      res.json({ received: true, event: result.event });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Erreur webhook Stripe [msylla01]:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/payments/methods - Méthodes de paiement disponibles
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: 'stripe',
        name: 'Carte Bancaire',
        description: 'Visa, Mastercard, American Express, CB',
        icon: '💳',
        enabled: true,
        fees: 2.9, // 2.9%
        currencies: ['EUR', 'USD'],
        supported_countries: ['FR', 'EU', 'US', 'CA']
      }
    ],
    default_method: 'stripe',
    currency: 'EUR',
    timestamp: new Date().toISOString(),
    developer: 'msylla01'
  });
});

module.exports = router;
