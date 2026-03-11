const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const v = await prisma.vistoria.findMany({
      include: {
        estabelecimento: { select: { id: true, razao_social: true, municipio: true } },
        fiscal: { select: { id: true, nome: true, email: true } },
        checklist_modelo: { select: { id: true, titulo: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('vistorias', v.length);
  } catch (e) {
    console.error('vistoria error', e);
  }

  try {
    const p = await prisma.protocolo.findMany({
      include: {
        estabelecimento: { select: { id: true, razao_social: true, cnpj_cpf: true } },
        eventos: { orderBy: { created_at: 'asc' } }
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('protocolos', p.length);
  } catch (e) {
    console.error('protocolo error', e);
  }

  try {
    const t = await prisma.registroTitulo.findMany({
      include: { estabelecimento: { select: { id: true, razao_social: true, cnpj_cpf: true } } },
      orderBy: { created_at: 'desc' }
    });
    console.log('titulos', t.length);
  } catch (e) {
    console.error('titulo error', e);
  }

  await prisma.$disconnect();
})(); 
