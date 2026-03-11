const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@siapp.mt.gov.br';
  const existing = await prisma.usuario.findUnique({ where: { email } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email,
        senha: hashedPassword,
        cargo: 'ADMIN'
      }
    });
    console.log('Admin criado com sucesso!');
  } else {
    console.log('Admin já existe.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
