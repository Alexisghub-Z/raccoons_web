import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Eliminando datos de prueba...\n');

  // Buscar usuarios de prueba (emails @test.com)
  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@test.com' } },
    select: { id: true }
  });

  const testUserIds = testUsers.map(u => u.id);

  if (testUserIds.length === 0) {
    console.log('  No se encontraron datos de prueba.');
    return;
  }

  // Eliminar servicios de esos usuarios (cascade elimina evidence, history, notifications)
  const deletedServices = await prisma.service.deleteMany({
    where: { customerId: { in: testUserIds } }
  });
  console.log(`  Servicios eliminados: ${deletedServices.count}`);

  // Eliminar notificaciones de esos usuarios
  const deletedNotifications = await prisma.notification.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`  Notificaciones eliminadas: ${deletedNotifications.count}`);

  // Eliminar usuarios de prueba
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { endsWith: '@test.com' } }
  });
  console.log(`  Usuarios eliminados: ${deletedUsers.count}`);

  console.log('\n✅ Datos de prueba eliminados correctamente.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
