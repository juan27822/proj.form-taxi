const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'juan'; // El usuario que quieres crear/actualizar
  const newPassword = 'password'; // La contraseña que quieres establecer

  console.log(`Intentando crear o actualizar el usuario: ${username}`);

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Usar 'upsert' para crear el usuario si no existe, o actualizarlo si ya existe.
  const user = await prisma.user.upsert({
    where: { username: username },
    update: { password: hashedPassword },
    create: {
      username: username,
      password: hashedPassword,
      role: 'ADMIN', // Asignar rol de administrador al crearlo
    },
  });

  console.log(`✅ Contraseña actualizada correctamente para el usuario: ${user.username}`);
  console.log('Ahora puedes iniciar sesión con:');
  console.log(`   Usuario: ${username}`);
  console.log(`   Contraseña: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
