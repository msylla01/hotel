const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware de sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Hotel API Backend Running [msylla01] - 2025-10-03 12:38:57'
  });
});

// Routes API (SANS reviews)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hotel Management API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users',
      'GET /api/rooms',
      'GET /api/bookings'
    ],
    developer: 'msylla01',
    timestamp: '2025-10-03 12:38:57'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  console.log(`❌ Route non trouvée: ${req.method} ${req.originalUrl} [msylla01]`);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /health',
      'GET /',
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'GET /api/rooms',
      'GET /api/bookings'
    ]
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur [msylla01]:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur serveur'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT} [msylla01] - 2025-10-03 12:38:57`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Routes: http://localhost:${PORT}/`);
  console.log(`❌ Reviews supprimées - pas d'API avis`);
});

module.exports = app;
