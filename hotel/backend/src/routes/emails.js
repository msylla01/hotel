const express = require('express');
const emailService = require('../services/emailService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/emails/test - Tester l'envoi d'email
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = email || req.user.email;

    const result = await emailService.sendTestEmail(targetEmail);

    if (result.success) {
      res.json({
        success: true,
        message: `Email de test envoyé à ${targetEmail}`,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        developer: 'msylla01'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Échec envoi email de test',
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Erreur route test email [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du test email',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/emails/booking-confirmation - Simuler email de confirmation
router.post('/booking-confirmation', authenticateToken, async (req, res) => {
  try {
    // Données simulées pour démonstration
    const mockBooking = {
      id: 'BOOK_' + Date.now(),
      checkIn: new Date('2025-12-15'),
      checkOut: new Date('2025-12-18'),
      guests: 2
    };

    const mockPayment = {
      amount: 540,
      transactionId: 'TXN_' + Date.now().toString().slice(-8)
    };

    const result = await emailService.sendBookingConfirmation(
      mockBooking,
      mockPayment,
      req.user
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Email de confirmation envoyé',
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        developer: 'msylla01'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Échec envoi email de confirmation',
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Erreur email confirmation [msylla01]:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi de confirmation',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
