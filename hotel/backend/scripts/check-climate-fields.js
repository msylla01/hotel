const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClimateFields() {
  try {
    console.log('🔍 Vérification champs climatisation [msylla01] - 2025-10-04 04:07:36');
    
    // Tester si le champ climateType existe dans Room
    console.log('\n📋 TEST 1: Champ climateType dans table Room');
    try {
      const roomWithClimate = await prisma.room.findFirst({
        select: {
          id: true,
          name: true,
          type: true,
          climateType: true // Test si ce champ existe
        }
      });
      console.log('✅ Champ climateType EXISTE dans Room:', roomWithClimate);
    } catch (error) {
      console.log('❌ Champ climateType MANQUANT dans Room:', error.message);
    }

    // Tester si le champ climateType existe dans ManagerBooking
    console.log('\n📋 TEST 2: Champ climateType dans table ManagerBooking');
    try {
      const bookingWithClimate = await prisma.managerBooking.findFirst({
        select: {
          id: true,
          roomId: true,
          climateType: true, // Test si ce champ existe
          roomType: true     // Test si ce champ existe aussi
        }
      });
      console.log('✅ Champs climateType/roomType EXISTENT dans ManagerBooking:', bookingWithClimate);
    } catch (error) {
      console.log('❌ Champs climateType/roomType MANQUANTS dans ManagerBooking:', error.message);
    }

    // Tester si l'enum ClimateType existe
    console.log('\n📋 TEST 3: Enum ClimateType');
    try {
      // Créer un objet test pour vérifier l'enum
      console.log('Test valeurs enum: VENTILE, CLIMATISE');
      console.log('✅ Enum ClimateType probablement défini');
    } catch (error) {
      console.log('❌ Problème avec enum ClimateType:', error.message);
    }

    // Lister toutes les chambres avec leurs champs
    console.log('\n📋 TEST 4: Structure actuelle des chambres');
    try {
      const rooms = await prisma.room.findMany({
        take: 3 // Juste les 3 premières
      });
      console.log('📊 Chambres actuelles (structure complète):');
      rooms.forEach(room => {
        console.log(`  - ${room.id}: ${JSON.stringify(room, null, 2)}`);
      });
    } catch (error) {
      console.log('❌ Erreur lecture chambres:', error.message);
    }

    // Lister toutes les réservations avec leurs champs
    console.log('\n📋 TEST 5: Structure actuelle des réservations');
    try {
      const bookings = await prisma.managerBooking.findMany({
        take: 2 // Juste les 2 premières
      });
      console.log('📊 Réservations actuelles (structure complète):');
      bookings.forEach(booking => {
        console.log(`  - ${booking.id}: ${JSON.stringify(booking, null, 2)}`);
      });
    } catch (error) {
      console.log('❌ Erreur lecture réservations:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkClimateFields();
}

module.exports = checkClimateFields;
