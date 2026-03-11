const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertUsers() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const fiscalPass = await bcrypt.hash('fiscal123', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@siapp.mt.gov.br' },
    update: { nome: 'Administrador', cargo: 'ADMIN', ativo: true },
    create: {
      nome: 'Administrador',
      email: 'admin@siapp.mt.gov.br',
      senha: adminPass,
      cargo: 'ADMIN',
      ativo: true
    }
  });

  await prisma.usuario.upsert({
    where: { email: 'fiscal@siapp.mt.gov.br' },
    update: { nome: 'Fiscal SIAPP', cargo: 'FISCAL', ativo: true },
    create: {
      nome: 'Fiscal SIAPP',
      email: 'fiscal@siapp.mt.gov.br',
      senha: fiscalPass,
      cargo: 'FISCAL',
      ativo: true
    }
  });
}

async function upsertCategorias() {
  const categorias = [
    'Queijo',
    'Iogurte',
    'Linguiça',
    'Mel',
    'Ovos',
    'Pescado'
  ];

  for (const nome of categorias) {
    await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome }
    });
  }
}

async function ensureChecklistModel({ titulo, tipo_industria, versao, itens }) {
  const existente = await prisma.checklistModelo.findFirst({
    where: { titulo, tipo_industria, versao }
  });

  if (existente) return existente.id;

  const criado = await prisma.checklistModelo.create({
    data: {
      titulo,
      tipo_industria,
      versao,
      ativo: true,
      itens: {
        create: itens.map((item, idx) => ({
          grupo: item.grupo,
          texto_pergunta: item.pergunta,
          ordem: idx + 1,
          peso_risco: item.risco
        }))
      }
    }
  });

  return criado.id;
}

async function seedChecklists() {
  await ensureChecklistModel({
    titulo: 'Checklist SIAPP - Leite',
    tipo_industria: 'LEITE',
    versao: '1.0',
    itens: [
      { grupo: 'AREA_EXTERNA', pergunta: 'As vias de acesso estão em boas condições?', risco: 'MEDIO' },
      { grupo: 'INSTALACOES', pergunta: 'As áreas de produção estão segregadas da área doméstica?', risco: 'GRAVE' },
      { grupo: 'HIGIENE', pergunta: 'Existe rotina formal de limpeza e sanitização?', risco: 'GRAVE' },
      { grupo: 'PESSOAL', pergunta: 'Os manipuladores usam EPI adequado?', risco: 'MEDIO' }
    ]
  });

  await ensureChecklistModel({
    titulo: 'Checklist SIAPP - Carne',
    tipo_industria: 'CARNE',
    versao: '1.0',
    itens: [
      { grupo: 'AREA_EXTERNA', pergunta: 'Há controle de pragas no entorno?', risco: 'GRAVE' },
      { grupo: 'INSTALACOES', pergunta: 'Há fluxo adequado para evitar contaminação cruzada?', risco: 'GRAVE' },
      { grupo: 'HIGIENE', pergunta: 'Equipamentos passam por higienização documentada?', risco: 'GRAVE' },
      { grupo: 'PESSOAL', pergunta: 'Manipuladores possuem treinamento vigente?', risco: 'MEDIO' }
    ]
  });

  await ensureChecklistModel({
    titulo: 'Checklist SIAPP - Ovos',
    tipo_industria: 'OVOS',
    versao: '1.0',
    itens: [
      { grupo: 'AREA_EXTERNA', pergunta: 'Há barreiras sanitárias adequadas?', risco: 'MEDIO' },
      { grupo: 'INSTALACOES', pergunta: 'Área de classificação está em conformidade?', risco: 'GRAVE' },
      { grupo: 'HIGIENE', pergunta: 'Há controle de lavagem/desinfecção das bandejas?', risco: 'MEDIO' }
    ]
  });

  await ensureChecklistModel({
    titulo: 'Checklist SIAPP - Mel',
    tipo_industria: 'MEL',
    versao: '1.0',
    itens: [
      { grupo: 'AREA_EXTERNA', pergunta: 'Unidade protegida de fontes de contaminação?', risco: 'MEDIO' },
      { grupo: 'INSTALACOES', pergunta: 'Equipamentos de extração em bom estado?', risco: 'MEDIO' },
      { grupo: 'HIGIENE', pergunta: 'Existe controle de limpeza e rastreabilidade?', risco: 'GRAVE' }
    ]
  });

  await ensureChecklistModel({
    titulo: 'Checklist SIAPP - Pescado',
    tipo_industria: 'PESCADO',
    versao: '1.0',
    itens: [
      { grupo: 'AREA_EXTERNA', pergunta: 'Área de recepção possui drenagem adequada?', risco: 'MEDIO' },
      { grupo: 'INSTALACOES', pergunta: 'Cadeia fria é monitorada continuamente?', risco: 'GRAVE' },
      { grupo: 'HIGIENE', pergunta: 'Há controle de água potável e gelo?', risco: 'GRAVE' }
    ]
  });
}

async function upsertDemoEstabelecimento() {
  const senha = await bcrypt.hash('123mudar', 10);

  await prisma.estabelecimento.upsert({
    where: { email: 'demo@agro.mt' },
    update: {
      razao_social: 'Agroindústria Demo LTDA',
      atividade_principal: 'LEITE',
      status: 'EM_ANALISE'
    },
    create: {
      tipo_pessoa: 'JURIDICA',
      cnpj_cpf: '11222333000181',
      razao_social: 'Agroindústria Demo LTDA',
      nome_fantasia: 'Demo Leite',
      inscricao_estadual: '123456789',
      endereco: 'Estrada Rural KM 10',
      numero: 'S/N',
      bairro: 'Zona Rural',
      complemento: null,
      municipio: 'Cuiabá',
      uf: 'MT',
      cep: '78000000',
      telefone: '65999999999',
      email: 'demo@agro.mt',
      atividade_principal: 'LEITE',
      classificacao: 'Artesanal',
      agricultura_familiar: true,
      localizacao: 'Zona Rural',
      area_construida: 180,
      faturamento_anual: 300000,
      participa_outra_empresa: false,
      possui_filial: false,
      participa_capital_outra: false,
      socio_outra_empresa_nao_beneficiada: false,
      socio_administrador_outra: false,
      resp_legal_nome: 'Produtor Demo',
      resp_legal_cpf: '12345678901',
      senha,
      primeiro_acesso: false,
      status: 'EM_ANALISE'
    }
  });
}

async function main() {
  console.log('Seed completo do SIAPP iniciado...');
  await upsertUsers();
  await upsertCategorias();
  await seedChecklists();
  await upsertDemoEstabelecimento();
  console.log('Seed completo finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
