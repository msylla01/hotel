const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreOriginalRoomNames() {
  try {
    console.log('🏨 Restauration noms originaux chambres [msylla01] - 2025-10-04 22:21:26');

    // Récupérer toutes les chambres actuelles
    const rooms = await prisma.room.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`📋 ${rooms.length} chambres trouvées`);

    // Proposer des noms réalistes d'hôtel au lieu de CH1, CH2...
    const originalRoomNames = [
      { pattern: /^CH1/, newName: 'Chambre 101' },
      { pattern: /^CH2/, newName: 'Suite 201' },
      { pattern: /^CH3/, newName: 'Chambre 102' },
      { pattern: /^CH4/, newName: 'Chambre 103' },
      { pattern: /^CH5/, newName: 'Suite 202' },
      // Pour les chambres supplémentaires
      { pattern: /^CH6/, newName: 'Chambre 104' },
      { pattern: /^CH7/, newName: 'Suite 203' },
      { pattern: /^CH8/, newName: 'Chambre 105' }
    ];

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      let newName = room.name;

      // Si le nom actuel commence par "CH", le remplacer
      if (room.name.startsWith('CH')) {
        const nameMapping = originalRoomNames[i];
        if (nameMapping) {
          newName = nameMapping.newName;
        } else {
          // Générer un nom basé sur l'index pour les chambres supplémentaires
          const floor = Math.floor(i / 4) + 1;
          const roomNumber = (i % 4) + 1;
          const roomNum = floor * 100 + roomNumber;
          
          if (room.type === 'SUITE') {
            newName = `Suite ${roomNum}`;
          } else {
            newName = `Chambre ${roomNum}`;
          }
        }

        await prisma.room.update({
          where: { id: room.id },
          data: { name: newName }
        });

        console.log(`✅ ${room.name} → ${newName} (${room.type})`);
      } else {
        console.log(`⏭️ ${room.name} - nom déjà original`);
      }
    }

    // Afficher le résultat final
    const updatedRooms = await prisma.room.findMany({
      select: { id: true, name: true, type: true, climateType: true, price: true },
      orderBy: { name: 'asc' }
    });

    console.log('\n📊 NOMS FINAUX DES CHAMBRES :');
    updatedRooms.forEach(room => {
      console.log(`   ${room.name} | ${room.type} | ${room.climateType} | ${room.price}€`);
    });

    console.log(`\n✅ ${updatedRooms.length} chambres mises à jour avec noms originaux !`);
    return updatedRooms;

  } catch (error) {
    console.error('❌ Erreur restauration noms [msylla01]:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  restoreOriginalRoomNames()
    .then(() => {
      console.log('\n🎉 RESTAURATION NOMS TERMINÉE !');
      console.log('\n📋 PROCHAINES ÉTAPES :');
      console.log('1. Mettre à jour le frontend pour afficher les vrais noms');
      console.log('2. Redémarrer le backend si nécessaire');
      console.log('3. Tester l\'affichage dans le dashboard manager');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 ÉCHEC RESTAURATION:', error.message);
      process.exit(1);
    });
}

module.exports = restoreOriginalRoomNames;
