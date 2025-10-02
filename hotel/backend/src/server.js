const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

console.log('🔄 Initialisation serveur Hotel Management API [msylla01] - 2025-10-02 00:27:12...');

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
  const favoritesRoutes = require('./routes/favorites'); // AJOUTÉ
  const paymentsRoutes = require('./routes/payments');
  const mobilePaymentsRoutes = require('./routes/mobile-payments');
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
  app.use('/api/favorites', authenticateToken, favoritesRoutes); // AJOUTÉ
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/mobile-payments', authenticateToken, mobilePaymentsRoutes);

  // Routes qui nécessitent un compte ACTIF
  app.use('/api/bookings', authenticateToken, requireActiveAccount, bookingRoutes);
  app.use('/api/payments', authenticateToken, requireActiveAccount, paymentRoutes);
  app.use('/api/emails', authenticateToken, requireActiveAccount, emailRoutes);

  // Routes admin (nécessitent compte actif + rôle admin)
  app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes);

  // Error handling
  app.use(errorHandler);

  console.log('✅ Routes chargées avec API favoris [msylla01]');
} catch (error) {
  console.error('❌ Erreur chargement routes [msylla01]:', error);
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
      rooms: 'API Rooms Active',
      bookings: 'API Bookings Active',
      favorites: 'API Favorites Active',
      payments: 'Stripe Active',
      emails: 'Nodemailer Ready',
      chatbot: 'IA Active',
      database: 'PostgreSQL Connected'
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
    services: ['Chambres', 'Réservations', 'Favoris', 'Paiements', 'Emails', 'Chatbot'],
    endpoints: {
      auth: 'POST /api/auth/login',
      rooms: 'GET /api/rooms (public)',
      roomDetail: 'GET /api/rooms/:id (public)',
      bookings: 'GET /api/bookings (requires active account)',
      favorites: 'GET /api/favorites (authenticated)',
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
  console.log(`🏨 Rooms API: http://localhost:${PORT}/api/rooms`);
  console.log(`📋 Bookings API: http://localhost:${PORT}/api/bookings`);
  console.log(`❤️ Favorites API: http://localhost:${PORT}/api/favorites`);
  console.log(`👤 Dev: msylla01`);
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🎯 Services: Chambres + Réservations + Favoris + Paiements`);
  console.log('===============================================\n');
});

module.exports = app;
