const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

console.log('🔄 Initialisation du serveur Hotel Management API [msylla01]...');

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
  
  const { authenticateToken } = require('./middleware/auth');
  const errorHandler = require('./middleware/errorHandler');

  // Routes publiques
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);

  // Routes protégées
  app.use('/api/bookings', authenticateToken, bookingRoutes);
  app.use('/api/payments', authenticateToken, paymentRoutes);
  app.use('/api/admin', authenticateToken, adminRoutes);

  // Error handling
  app.use(errorHandler);

  console.log('✅ Routes chargées avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes:', error);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK ✅', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    developer: 'msylla01',
    version: '1.0.0'
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Hotel Management API 🏨',
    version: '1.0.0',
    developer: 'msylla01',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/rooms',
      'GET /api/rooms/:id'
    ]
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
  console.log('\n🎉 ===== SERVEUR DÉMARRÉ =====');
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`👤 Dev: msylla01`);
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log('==============================\n');
});

module.exports = app;
