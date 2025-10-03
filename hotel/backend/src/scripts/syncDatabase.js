const sequelize = require('../config/database');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

async function syncDatabase() {
  try {
    console.log('🔄 Synchronisation base de données [msylla01] - 2025-10-03 11:12:32');
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL établie [msylla01]');
    
    // Synchroniser tous les modèles
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base [msylla01]');
    
    // Vérifier les tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tables disponibles [msylla01]:', tables);
    
    console.log('🎉 Synchronisation terminée avec succès [msylla01]');
    
  } catch (error) {
    console.error('❌ Erreur synchronisation [msylla01]:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  syncDatabase()
    .then(() => {
      console.log('✅ Script terminé [msylla01]');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script échoué [msylla01]:', error);
      process.exit(1);
    });
}

module.exports = syncDatabase;
