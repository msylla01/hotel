const express = require('express');
const chatbotService = require('../services/chatbotService');

const router = express.Router();

// POST /api/chatbot/message - Chat avec l'IA
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.headers.authorization ? 'user_connected' : null;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message requis',
        timestamp: new Date().toISOString()
      });
    }

    const response = await chatbotService.generateResponse(message, userId);

    res.json({
      success: true,
      ...response,
      developer: 'msylla01'
    });

  } catch (error) {
    console.error('❌ Erreur route chatbot [msylla01]:', error);
    res.status(500).json({
      success: false,
      response: "Erreur technique ! Contactez l'équipe 📞",
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chatbot/suggestions - Suggestions de conversation
router.get('/suggestions', (req, res) => {
  res.json({
    success: true,
    suggestions: [
      {
        category: "Réservation",
        items: [
          "Comment réserver une chambre ?",
          "Quelles chambres sont disponibles ?",
          "Prix des chambres",
          "Modifier une réservation"
        ]
      },
      {
        category: "Paiement", 
        items: [
          "Moyens de paiement acceptés",
          "Sécurité des paiements",
          "Tester un paiement",
          "Problème de paiement"
        ]
      },
      {
        category: "Technique",
        items: [
          "Qui a développé ce site ?",
          "Technologies utilisées",
          "Code source",
          "msylla01"
        ]
      },
      {
        category: "Contact",
        items: [
          "Contacter l'hôtel",
          "Numéro de téléphone",
          "Adresse",
          "Urgence"
        ]
      }
    ],
    timestamp: new Date().toISOString(),
    developer: 'msylla01'
  });
});

// GET /api/chatbot/stats - Statistiques IA
router.get('/stats', (req, res) => {
  const stats = chatbotService.getStats();
  res.json({
    success: true,
    stats,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
