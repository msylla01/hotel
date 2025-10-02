const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

console.log('🔄 Initialisation du serveur Hotel Management API [msylla01] - 2025-10-01 18:03:13...');

// Middleware de base
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import et utilisation des routes
try {
  const authRoutes = require('./routes/auth');
  const roomRoutes = require('./routes/rooms');
  const bookingRoutes = require('./routes/bookings');
  const paymentRoutes = require('./routes/payments');
  const adminRoutes = require('./routes/admin');
  const emailRoutes = require('./routes/emails');
  const chatbotRoutes = require('./routes/chatbot');
  const userRoutes = require('./routes/users');
  
  const { authenticateToken, requireActiveAccount, requireAdmin } = require('./middleware/auth');
  const errorHandler = require('./middleware/errorHandler');

  // Routes publiques
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/chatbot', chatbotRoutes);

  // Routes qui nécessitent juste une authentification (même compte désactivé)
  app.use('/api/users', authenticateToken, userRoutes);

  // Routes qui nécessitent un compte ACTIF
  app.use('/api/bookings', authenticateToken, requireActiveAccount, bookingRoutes);
  app.use('/api/payments', authenticateToken, requireActiveAccount, paymentRoutes);
  app.use('/api/emails', authenticateToken, requireActiveAccount, emailRoutes);

  // Routes admin (nécessitent compte actif + rôle admin)
  app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes);

  // Error handling
  app.use(errorHandler);

  console.log('✅ Routes chargées avec logique de désactivation [msylla01]');
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes [msylla01]:', error);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK ✅', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    developer: 'msylla01',
    version: '1.0.0',
    services: {
      payments: 'Stripe Active',
      emails: 'Nodemailer Ready',
      chatbot: 'IA Active',
      database: 'PostgreSQL Connected',
      deactivation: 'Temporary Deactivation Logic Active'
    }
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Hotel Management API 🏨',
    version: '1.0.0',
    developer: 'msylla01',
    timestamp: new Date().toISOString(),
    services: ['Paiements', 'Emails', 'Chatbot IA', 'Désactivation Temporaire'],
    endpoints: {
      auth: 'POST /api/auth/login',
      rooms: 'GET /api/rooms',
      bookings: 'GET /api/bookings (requires active account)',
      payments: 'POST /api/payments/create-intent (requires active account)',
      emails: 'POST /api/emails/test (requires active account)',
      chatbot: 'POST /api/chatbot/message',
      users: 'GET /api/users/profile (allows deactivated)'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🎉 ===== SERVEUR HOTEL LUXE DÉMARRÉ =====');
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`👤 Dev: msylla01`);
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🎯 Services: Paiements + Emails + Chatbot + Désactivation Temporaire`);
  console.log('================================================\n');
});

module.exports = app;
