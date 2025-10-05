const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRoomNamesToCodes() {
  try {
    console.log('🏷️ Mise à jour noms chambres vers codes [msylla01] - 2025-10-04 03:22:14');

    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'asc' }
    });

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const roomCode = `CH${i + 1}`;

      await prisma.room.update({
        where: { id: room.id },
        data: { 
          name: roomCode, // SEULEMENT LE CODE
          // Ajouter climateType par défaut si pas encore fait
          climateType: room.climateType || (room.type === 'SUITE' || room.type === 'DELUXE' ? 'CLIMATISE' : 'VENTILE')
        }
      });

      console.log(`✅ ${room.name} → ${roomCode} (${room.climateType || 'VENTILE'})`);
    }

    console.log('✅ Mise à jour codes chambres terminée');

  } catch (error) {
    console.error('❌ Erreur mise à jour codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateRoomNamesToCodes();
}

module.exports = updateRoomNamesToCodes;
