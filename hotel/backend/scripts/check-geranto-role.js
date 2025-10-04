const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGerantoRole() {
  try {
    console.log('�� Vérification rôle GERANTO [msylla01] - 2025-10-04 02:02:12');
    
    const user = await prisma.user.findUnique({
      where: { email: 'geranto@hotelluxe.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (user) {
      console.log('👤 UTILISATEUR TROUVÉ :');
      console.log('   Email:', user.email);
      console.log('   Rôle ACTUEL:', user.role);
      console.log('   Rôle ATTENDU: MANAGER');
      console.log('   Actif:', user.isActive);
      console.log('');
      
      if (user.role !== 'MANAGER') {
        console.log('❌ PROBLÈME DÉTECTÉ : Rôle incorrect !');
        console.log('   Rôle actuel:', user.role);
        console.log('   Rôle requis: MANAGER');
        console.log('');
        console.log('🔧 CORRECTION EN COURS...');
        
        // Corriger le rôle
        const updated = await prisma.user.update({
          where: { email: 'geranto@hotelluxe.com' },
          data: {
            role: 'MANAGER',
            isActive: true
          }
        });
        
        console.log('✅ RÔLE CORRIGÉ !');
        console.log('   Nouveau rôle:', updated.role);
        console.log('   Actif:', updated.isActive);
      } else {
        console.log('✅ RÔLE CORRECT : MANAGER');
      }
    } else {
      console.log('❌ UTILISATEUR NON TROUVÉ !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkGerantoRole();
