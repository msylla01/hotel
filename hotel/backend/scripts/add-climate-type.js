const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addClimateType() {
  try {
    console.log('🌡️ Ajout type climatisation aux chambres [msylla01] - 2025-10-04 02:57:35');

    // Appliquer la migration Prisma d'abord
    console.log('📦 Application migration Prisma...');
    
    // Les chambres seront automatiquement mises à jour avec VENTILE par défaut
    // Mettons à jour quelques chambres pour être CLIMATISE
    const rooms = await prisma.room.findMany();
    
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      
      // Les suites et deluxe sont climatisées par défaut
      const climateType = ['SUITE', 'DELUXE'].includes(room.type) ? 'CLIMATISE' : 'VENTILE';
      
      await prisma.room.update({
        where: { id: room.id },
        data: { climateType }
      });
      
      console.log(`✅ ${room.name} → ${climateType}`);
    }

    console.log('✅ Migration type climatisation terminée');

  } catch (error) {
    console.error('❌ Erreur migration climatisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addClimateType();
}

module.exports = addClimateType;
