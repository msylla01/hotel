const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createManager() {
  try {
    console.log('👨‍💼 Création compte gérant [msylla01] - 2025-10-04 01:27:33');

    // Vérifier si un gérant existe déjà
    let manager = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'gerant@hotelluxe.com' },
          { role: 'MANAGER' }
        ]
      }
    });

    if (manager) {
      // Mettre à jour le compte existant
      manager = await prisma.user.update({
        where: { id: manager.id },
        data: {
          email: 'gerant@hotelluxe.com',
          role: 'MANAGER',
          isActive: true,
          emailVerified: true,
          firstName: 'Jean',
          lastName: 'GERANT'
        }
      });
      console.log('✅ Compte gérant mis à jour:', manager.email);
    } else {
      // Créer un nouveau compte
      const hashedPassword = await bcrypt.hash('manager123', 12);
      
      manager = await prisma.user.create({
        data: {
          email: 'gerant@hotelluxe.com',
          password: hashedPassword,
          firstName: 'Jean',
          lastName: 'GERANT',
          phone: '+221 77 123 45 67',
          role: 'MANAGER',
          isActive: true,
          emailVerified: true
        }
      });
      console.log('✅ Nouveau compte gérant créé:', manager.email);
    }

    console.log('');
    console.log('🔑 IDENTIFIANTS DE CONNEXION :');
    console.log('   📧 Email : gerant@hotelluxe.com');
    console.log('   🔒 Mot de passe : manager123');
    console.log('   👤 Rôle : MANAGER');
    console.log('');
    console.log('🌐 ACCÈS :');
    console.log('   🔐 Connexion : http://localhost:3000/auth/login');
    console.log('   🏨 Dashboard : http://localhost:3000/manager');
    console.log('   🧪 Test : http://localhost:5000/api/manager/test');

    return manager;

  } catch (error) {
    console.error('❌ Erreur création gérant [msylla01]:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createManager().catch(console.error);
}

module.exports = createManager;
