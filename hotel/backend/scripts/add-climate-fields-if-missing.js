const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addClimateFieldsIfMissing() {
  try {
    console.log('🔧 Ajout champs climatisation si manquants [msylla01] - 2025-10-04 04:07:36');

    // Test si les champs existent déjà
    let roomHasClimate = false;
    let bookingHasClimate = false;

    try {
      await prisma.room.findFirst({
        select: { climateType: true }
      });
      roomHasClimate = true;
      console.log('✅ Room.climateType existe déjà');
    } catch (error) {
      console.log('❌ Room.climateType manquant');
    }

    try {
      await prisma.managerBooking.findFirst({
        select: { climateType: true }
      });
      bookingHasClimate = true;
      console.log('✅ ManagerBooking.climateType existe déjà');
    } catch (error) {
      console.log('❌ ManagerBooking.climateType manquant');
    }

    if (roomHasClimate && bookingHasClimate) {
      console.log('🎉 Tous les champs climatisation existent déjà !');
      return;
    }

    console.log('🚨 Champs climatisation manquants - ajout nécessaire');
    console.log('📋 Solutions:');
    console.log('1. Ajouter au schema.prisma:');
    console.log('');
    console.log('enum ClimateType {');
    console.log('  CLIMATISE');
    console.log('  VENTILE');
    console.log('}');
    console.log('');
    console.log('model Room {');
    console.log('  // ... autres champs ...');
    console.log('  climateType     ClimateType @default(VENTILE)');
    console.log('}');
    console.log('');
    console.log('model ManagerBooking {');
    console.log('  // ... autres champs ...');
    console.log('  climateType     ClimateType?');
    console.log('  roomType        String?');
    console.log('}');
    console.log('');
    console.log('2. Puis exécuter:');
    console.log('   npx prisma migrate dev --name add_climate_type');
    console.log('   npx prisma generate');

  } catch (error) {
    console.error('❌ Erreur vérification champs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addClimateFieldsIfMissing();
}

module.exports = addClimateFieldsIfMissing;
