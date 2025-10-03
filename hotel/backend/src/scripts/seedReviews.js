const { User, Room, Review } = require('../models');

async function seedReviews() {
  try {
    console.log('🌱 Ajout avis d\'exemple [msylla01] - 2025-10-03 11:12:32');

    // Récupérer des utilisateurs et chambres existants
    const users = await User.findAll({ limit: 5 });
    const rooms = await Room.findAll({ limit: 5 });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Créez des utilisateurs d\'abord.');
      return;
    }

    if (rooms.length === 0) {
      console.log('❌ Aucune chambre trouvée. Créez des chambres d\'abord.');
      return;
    }

    console.log(`📊 Trouvé ${users.length} utilisateurs et ${rooms.length} chambres [msylla01]`);

    const sampleReviews = [
      {
        userId: users[0].id,
        roomId: rooms[0].id,
        rating: 5,
        title: 'Séjour exceptionnel !',
        comment: 'Chambre magnifique, service impeccable et personnel très accueillant. Vue splendide et propreté irréprochable. Je recommande vivement cet établissement pour un séjour de qualité.',
        pros: ['Propreté excellente', 'Personnel accueillant', 'Belle vue', 'Confort optimal'],
        cons: [],
        isVerified: true,
        status: 'APPROVED'
      },
      {
        userId: users[Math.min(1, users.length - 1)].id,
        roomId: rooms[0].id,
        rating: 4,
        title: 'Très bon hôtel',
        comment: 'Séjour très agréable dans l\'ensemble. Chambre confortable et bien équipée. Seul petit bémol, le WiFi pourrait être plus rapide. Sinon parfait pour un séjour d\'affaires.',
        pros: ['Chambre confortable', 'Bien situé', 'Petit-déjeuner correct'],
        cons: ['WiFi un peu lent'],
        isVerified: true,
        status: 'APPROVED'
      },
      {
        userId: users[Math.min(2, users.length - 1)].id,
        roomId: rooms[Math.min(1, rooms.length - 1)].id,
        rating: 5,
        title: 'Parfait pour une escapade romantique',
        comment: 'Nous avons passé un weekend merveilleux. La chambre double avec balcon était parfaite, très romantique avec une vue imprenable. Service aux petits soins.',
        pros: ['Vue magnifique', 'Ambiance romantique', 'Service excellent', 'Balcon privé'],
        cons: [],
        isVerified: true,
        status: 'APPROVED'
      }
    ];

    let createdCount = 0;
    
    for (const reviewData of sampleReviews) {
      try {
        // Vérifier qu'un avis n'existe pas déjà
        const existing = await Review.findOne({
          where: { 
            userId: reviewData.userId,
            roomId: reviewData.roomId
          }
        });

        if (!existing) {
          await Review.create(reviewData);
          createdCount++;
          console.log(`✅ Avis créé pour chambre ${reviewData.roomId} par utilisateur ${reviewData.userId} [msylla01]`);
        } else {
          console.log(`⚠️ Avis existe déjà pour chambre ${reviewData.roomId} par utilisateur ${reviewData.userId} [msylla01]`);
        }
      } catch (error) {
        console.error(`❌ Erreur création avis ${reviewData.title} [msylla01]:`, error.message);
      }
    }

    console.log(`✅ ${createdCount} nouveaux avis créés sur ${sampleReviews.length} tentatives [msylla01]`);

  } catch (error) {
    console.error('❌ Erreur générale creation avis d\'exemple [msylla01]:', error);
  }
}

module.exports = seedReviews;

// Exécuter si appelé directement
if (require.main === module) {
  seedReviews()
    .then(() => {
      console.log('✅ Script seedReviews terminé [msylla01]');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script seedReviews échoué [msylla01]:', error);
      process.exit(1);
    });
}
