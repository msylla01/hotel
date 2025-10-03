const { User, Room, Review } = require('../models');

async function verifySetup() {
  try {
    console.log('🔍 Vérification setup avis [msylla01] - 2025-10-03 11:12:32');
    
    // Vérifier les tables
    const users = await User.findAll();
    const rooms = await Room.findAll();
    const reviews = await Review.findAll();
    
    console.log(`�� Données trouvées [msylla01]:`);
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Chambres: ${rooms.length}`);
    console.log(`   - Avis: ${reviews.length}`);
    
    if (reviews.length > 0) {
      console.log(`📝 Avis par chambre [msylla01]:`);
      for (const room of rooms) {
        const roomReviews = await Review.findAll({ where: { roomId: room.id } });
        if (roomReviews.length > 0) {
          const avgRating = roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length;
          console.log(`   - ${room.name}: ${roomReviews.length} avis, moyenne ${avgRating.toFixed(1)}/5`);
        }
      }
    }
    
    console.log('✅ Vérification terminée [msylla01]');
    
  } catch (error) {
    console.error('❌ Erreur vérification [msylla01]:', error);
  }
}

if (require.main === module) {
  verifySetup().then(() => process.exit());
}

module.exports = verifySetup;
