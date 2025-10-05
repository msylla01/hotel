const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateRoomCodes() {
  try {
    console.log('��️ Génération codes chambres CH1, CH2... [msylla01] - 2025-10-04 02:57:35');

    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'asc' }
    });

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const roomCode = `CH${i + 1}`;
      const newName = `${roomCode} - ${room.name.replace(/^CH\d+ - /, '')}`;

      await prisma.room.update({
        where: { id: room.id },
        data: { 
          name: newName,
          // Ajouter un champ roomCode si besoin
        }
      });

      console.log(`✅ ${room.name} → ${newName}`);
    }

    console.log('✅ Codes chambres générés avec succès');

  } catch (error) {
    console.error('❌ Erreur génération codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  generateRoomCodes();
}

module.exports = generateRoomCodes;
