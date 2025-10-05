const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateExistingDataPreserve() {
  try {
    console.log('🔄 Mise à jour données existantes [msylla01] - 2025-10-04 23:25:58');
    console.log('⚠️  AUCUNE SUPPRESSION - PRÉSERVATION TOTALE');

    // 1. Vérifier et compter les données existantes
    const existingRooms = await prisma.room.findMany();
    const existingBookings = await prisma.booking.findMany();
    const existingManagerBookings = await prisma.managerBooking.findMany();
    const existingUsers = await prisma.user.findMany();

    console.log('📊 DONNÉES EXISTANTES DÉTECTÉES :');
    console.log(`   🏨 Chambres: ${existingRooms.length}`);
    console.log(`   📋 Réservations: ${existingBookings.length}`);
    console.log(`   👨‍💼 Réservations manager: ${existingManagerBookings.length}`);
    console.log(`   👤 Utilisateurs: ${existingUsers.length}`);

    // 2. Mettre à jour les chambres existantes (ajouter climateType si manquant)
    console.log('\n🏨 Mise à jour chambres existantes...');
    for (const room of existingRooms) {
      if (!room.climateType) {
        // Assigner climateType basé sur le type de chambre
        const climateType = ['SUITE', 'DELUXE'].includes(room.type) ? 'CLIMATISE' : 'VENTILE';
        
        await prisma.room.update({
          where: { id: room.id },
          data: { climateType }
        });
        
        console.log(`   ✅ ${room.name}: ${room.type} → ${climateType}`);
      } else {
        console.log(`   ⏭️  ${room.name}: climateType déjà défini (${room.climateType})`);
      }
    }

    // 3. Mettre à jour les réservations manager existantes
    console.log('\n👨‍💼 Mise à jour réservations manager existantes...');
    for (const booking of existingManagerBookings) {
      const updateData = {};
      
      if (!booking.climateType) {
        // Récupérer la chambre pour déterminer le type de climatisation
        const room = await prisma.room.findUnique({
          where: { id: booking.roomId }
        });
        
        if (room) {
          updateData.climateType = room.climateType;
          updateData.roomType = room.type;
        } else {
          // Fallback si chambre non trouvée
          updateData.climateType = 'VENTILE';
          updateData.roomType = 'DOUBLE';
        }
      }
      
      if (!booking.roomType) {
        const room = await prisma.room.findUnique({
          where: { id: booking.roomId }
        });
        updateData.roomType = room?.type || 'DOUBLE';
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.managerBooking.update({
          where: { id: booking.id },
          data: updateData
        });
        
        console.log(`   ✅ Booking ${booking.id}: +climateType=${updateData.climateType}, +roomType=${updateData.roomType}`);
      } else {
        console.log(`   ⏭️  Booking ${booking.id}: déjà à jour`);
      }
    }

    // 4. Créer quelques chambres supplémentaires si très peu existent
    if (existingRooms.length < 3) {
      console.log('\n🆕 Ajout chambres supplémentaires (données insuffisantes)...');
      
      const additionalRooms = [
        {
          name: 'Chambre 101',
          description: 'Chambre double confortable',
          type: 'DOUBLE',
          climateType: 'VENTILE',
          price: 120,
          capacity: 2,
          isActive: true
        },
        {
          name: 'Suite 201',
          description: 'Suite luxueuse climatisée',
          type: 'SUITE',
          climateType: 'CLIMATISE',
          price: 250,
          capacity: 4,
          isActive: true
        }
      ];

      for (const roomData of additionalRooms) {
        // Vérifier si une chambre avec ce nom existe déjà
        const existing = await prisma.room.findFirst({
          where: { name: roomData.name }
        });
        
        if (!existing) {
          const room = await prisma.room.create({
            data: roomData
          });
          console.log(`   ✅ Créée: ${room.name} - ${room.type} ${room.climateType}`);
        } else {
          console.log(`   ⏭️  ${roomData.name} existe déjà`);
        }
      }
    }

    // 5. Vérification finale
    const finalRooms = await prisma.room.findMany();
    const finalManagerBookings = await prisma.managerBooking.findMany();

    console.log('\n📊 ÉTAT FINAL :');
    console.log(`   🏨 Chambres totales: ${finalRooms.length}`);
    console.log(`   👨‍💼 Réservations manager: ${finalManagerBookings.length}`);
    
    console.log('\n🏨 CHAMBRES FINALES :');
    finalRooms.forEach(room => {
      console.log(`   ${room.name} | ${room.type} | ${room.climateType || 'NON_DÉFINI'} | ${room.price}€`);
    });

    console.log('\n✅ MISE À JOUR TERMINÉE AVEC PRÉSERVATION COMPLÈTE !');

  } catch (error) {
    console.error('❌ Erreur mise à jour données [msylla01]:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingDataPreserve();
