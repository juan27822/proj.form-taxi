const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'juan';
  const newPassword = 'password';

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password in the database
  const updatedUser = await prisma.user.update({
    where: {
      username: username,
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log(`Successfully updated password for user: ${updatedUser.username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
