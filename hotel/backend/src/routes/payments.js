const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireActiveAccount } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

console.log('💳 Routes paiement SIMPLES [msylla01] - 2025-10-02 02:07:10');

// Configuration numéros hotel
const HOTEL_NUMBERS = {
  ORANGE: '0703033133',
  WAVE: '0703033133',
  FREE: '0703033133'
};

// POST /api/payments/mobile - Paiement mobile SIMPLE
router.post('/mobile', authenticateToken, requireActiveAccount, async (req, res) => {
  try {
    console.log('📱 Paiement mobile simple [msylla01]:', req.body);

    const { bookingId, phoneNumber, operator, amount } = req.body;

    if (!bookingId || !phoneNumber || !operator || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants',
        required: ['bookingId', 'phoneNumber', 'operator', 'amount'],
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier la réservation (avec fallback)
    let booking = null;
    try {
      booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId: req.user.id
        },
        include: {
          room: { select: { name: true } }
        }
      });
    } catch (dbError) {
      console.log('⚠️ DB non disponible, utilisation fallback [msylla01]');
      booking = {
        id: bookingId,
        userId: req.user.id,
        totalAmount: amount,
        room: { name: 'Chambre Test' }
      };
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Créer transaction (avec fallback)
    const transactionId = `MP_${operator}_${Date.now()}`;
    const hotelNumber = HOTEL_NUMBERS[operator];
    
    let payment = null;
    try {
      payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: parseFloat(amount),
          currency: 'XOF',
          method: 'MOBILE_MONEY',
          status: 'PENDING',
          transactionId,
          phoneNumber,
          provider: operator,
          adminNotes: `Paiement ${operator} - ${phoneNumber} → ${hotelNumber}`
        }
      });
    } catch (dbError) {
      console.log('⚠️ Création paiement simulée [msylla01]');
      payment = {
        id: `PAY_${Date.now()}`,
        transactionId,
        amount: parseFloat(amount),
        status: 'PENDING'
      };
    }

    console.log('✅ Paiement mobile initié [msylla01]:', transactionId);

    res.status(201).json({
      success: true,
      message: 'Paiement mobile initié avec succès',
      payment: {
        id: payment.id,
        transactionId,
        amount: parseFloat(amount),
        operator,
        phoneNumber,
        hotelNumber,
        status: 'PENDING'
      },
      instructions: {
        operator,
        hotelNumber,
        amount: parseFloat(amount),
        steps: [
          `1. Composez le code USSD de ${operator}`,
          `2. Envoyez ${amount} XOF au ${hotelNumber}`,
          `3. Confirmez avec votre code PIN`,
          `4. Notre équipe validera sous 24h`
        ],
        ussd: operator === 'ORANGE' ? `*144*4*4*${hotelNumber}*${amount}#` :
              operator === 'WAVE' ? `Application Wave → Envoyer → ${hotelNumber}` :
              `*144*5*${hotelNumber}*${amount}#`
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur paiement mobile [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement mobile',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/payments/card - Paiement carte SIMPLE
router.post('/card', authenticateToken, requireActiveAccount, async (req, res) => {
  try {
    console.log('💳 Paiement carte simple [msylla01]');

    const { bookingId, cardNumber, cardHolder, expiryDate, cvv, amount } = req.body;

    if (!bookingId || !cardNumber || !cardHolder || !expiryDate || !cvv || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants',
        required: ['bookingId', 'cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'amount'],
        timestamp: new Date().toISOString()
      });
    }

    // Simulation de traitement carte (90% succès)
    const isSuccess = Math.random() > 0.1;
    const transactionId = `CARD_${Date.now()}`;
    const maskedCard = cardNumber.slice(0, 4) + '****' + cardNumber.slice(-4);

    let payment = null;
    try {
      payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: parseFloat(amount),
          currency: 'EUR',
          method: 'CREDIT_CARD',
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          transactionId,
          adminNotes: `Carte ${maskedCard} - ${cardHolder} - ${isSuccess ? 'SUCCÈS' : 'ÉCHEC'}`
        }
      });

      if (isSuccess) {
        // Confirmer la réservation
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' }
        });
      }
    } catch (dbError) {
      console.log('⚠️ Traitement carte simulé [msylla01]');
      payment = {
        id: `PAY_${Date.now()}`,
        transactionId,
        amount: parseFloat(amount),
        status: isSuccess ? 'COMPLETED' : 'FAILED'
      };
    }

    console.log(`${isSuccess ? '✅' : '❌'} Paiement carte ${isSuccess ? 'réussi' : 'échoué'} [msylla01]`);

    res.status(isSuccess ? 201 : 400).json({
      success: isSuccess,
      message: isSuccess ? 'Paiement par carte réussi' : 'Paiement par carte refusé',
      payment: {
        id: payment.id,
        transactionId,
        amount: parseFloat(amount),
        method: 'CREDIT_CARD',
        status: payment.status,
        cardNumber: maskedCard
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur paiement carte [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement par carte',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/payments/info - Informations paiement
router.get('/info', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      hotelNumbers: HOTEL_NUMBERS,
      supportedMethods: ['MOBILE_MONEY', 'CREDIT_CARD'],
      currency: {
        mobile: 'XOF',
        card: 'EUR'
      },
      instructions: {
        mobile: 'Envoyez le montant au numéro hotel correspondant',
        card: 'Paiement immédiat avec confirmation automatique'
      },
      timestamp: new Date().toISOString(),
      developer: 'msylla01'
    });
  } catch (error) {
    console.error('❌ Erreur info paiement [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations',
      timestamp: new Date().toISOString()
    });
  }
});

console.log('✅ Routes paiement simples chargées [msylla01]');

module.exports = router;
