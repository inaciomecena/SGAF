const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient({
  log: ['error', 'warn']
});
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'siapp-secret-key-change-me';
const CHECKLIST_RESPOSTAS_VALIDAS = ['C', 'NC', 'NA', 'CR'];
const ADMIN_ROLES = ['ADMIN', 'ANALISTA'];
const STAFF_ROLES = ['ADMIN', 'ANALISTA', 'FISCAL'];
const STATUS_ESTAB = ['EM_ANALISE', 'PENDENTE_AJUSTES', 'EM_CREDENCIAMENTO', 'APROVADO', 'REPROVADO'];
const STATUS_TRANSITIONS = {
  EM_ANALISE: ['PENDENTE_AJUSTES', 'EM_CREDENCIAMENTO', 'REPROVADO'],
  PENDENTE_AJUSTES: ['EM_ANALISE', 'REPROVADO'],
  EM_CREDENCIAMENTO: ['APROVADO', 'PENDENTE_AJUSTES', 'REPROVADO'],
  APROVADO: [],
  REPROVADO: []
};

const canTransition = (fromStatus, toStatus) => {
  const allowed = STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
};

const generateProtocolNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 9000 + 1000);
  return `${y}${m}${d}-${rnd}`;
};

// Configuração do Multer para Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    console.log('Multer: destination called for file', file.originalname);
    if (!fs.existsSync(uploadDir)) {
      console.log('Multer: creating directory', uploadDir);
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nome do arquivo: timestamp-nomeoriginal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Servir arquivos estáticos

// Middleware de Autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth failed: Invalid token', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// --- ROTAS DE AUTH ---

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    // Tenta encontrar em Usuários (Admin/Analista)
    let usuario = await prisma.usuario.findUnique({ where: { email } });
    let tipo = 'admin';

    // Se não achou, tenta em Agroindústrias
    if (!usuario) {
      usuario = await prisma.estabelecimento.findFirst({ where: { email } });
      tipo = 'agroindustria';
    }

    if (!usuario) return res.status(401).json({ error: 'Credenciais inválidas' });

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas' });

    // Payload do Token
    const payload = { 
      id: usuario.id, 
      email: usuario.email, 
      tipo // 'admin' ou 'agroindustria'
    };

    if (tipo === 'admin') {
      payload.cargo = usuario.cargo;
    } else {
      payload.primeiro_acesso = usuario.primeiro_acesso;
      payload.razao_social = usuario.razao_social;
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    
    // Resposta
    const userResponse = {
      id: usuario.id,
      email: usuario.email,
      tipo
    };

    if (tipo === 'admin') {
      userResponse.nome = usuario.nome;
      userResponse.cargo = usuario.cargo;
    } else {
      userResponse.nome = usuario.razao_social; // Usa Razão Social como nome
      userResponse.primeiro_acesso = usuario.primeiro_acesso;
    }

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// Alterar Senha (Agroindústria)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { novaSenha } = req.body;
  
  if (req.user.tipo !== 'agroindustria') {
    return res.status(403).json({ error: 'Apenas agroindústrias podem alterar senha por aqui' });
  }

  try {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    await prisma.estabelecimento.update({
      where: { id: req.user.id },
      data: { 
        senha: hashedPassword,
        primeiro_acesso: false 
      }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// Setup Inicial (Cria admin se não existir)
app.post('/api/auth/setup', async (req, res) => {
  try {
    const count = await prisma.usuario.count();
    if (count > 0) return res.status(400).json({ error: 'Setup já realizado' });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@siapp.mt.gov.br',
        senha: hashedPassword,
        cargo: 'ADMIN'
      }
    });
    
    res.json({ message: 'Admin criado com sucesso', email: admin.email });
  } catch (error) {
    res.status(500).json({ error: 'Erro no setup' });
  }
});

// Meus Dados
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo === 'agroindustria') {
      const agroindustria = await prisma.estabelecimento.findUnique({
        where: { id: req.user.id }
      });
      if (!agroindustria) return res.status(404).json({ error: 'Agroindústria não encontrada' });
      // Remover senha do retorno
      const { senha, ...dados } = agroindustria;

      // Converter Decimals para evitar erro de serialização
      if (dados.area_construida) dados.area_construida = Number(dados.area_construida);
      if (dados.faturamento_anual) dados.faturamento_anual = Number(dados.faturamento_anual);

      return res.json(dados);
    }

    const usuario = await prisma.usuario.findUnique({ 
        where: { id: req.user.id },
        select: { id: true, nome: true, email: true, cargo: true, created_at: true }
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Atualizar Meus Dados
app.put('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo === 'agroindustria') {
      const dadosAtualizacao = req.body;
      
      // Buscar status atual para verificar permissão
      const estabelecimentoAtual = await prisma.estabelecimento.findUnique({
        where: { id: req.user.id },
        select: { status: true }
      });

      if (estabelecimentoAtual.status !== 'PENDENTE_AJUSTES') {
        // Se não estiver em ajuste, remove todos os campos exceto senha
        const chaves = Object.keys(dadosAtualizacao);
        for (const chave of chaves) {
          if (chave !== 'senha') {
            delete dadosAtualizacao[chave];
          }
        }
      }

      // Se houver senha, hashear
      if (dadosAtualizacao.senha) {
        dadosAtualizacao.senha = await bcrypt.hash(dadosAtualizacao.senha, 10);
      } else {
        delete dadosAtualizacao.senha;
      }

      // Remover campos que não devem ser alterados diretamente por aqui se necessário
      // Por enquanto permitindo edição geral exceto ID e CNPJ (que são chaves)
      delete dadosAtualizacao.id;
      delete dadosAtualizacao.cnpj_cpf;
      delete dadosAtualizacao.primeiro_acesso;
      delete dadosAtualizacao.status;

      const agroindustria = await prisma.estabelecimento.update({
        where: { id: req.user.id },
        data: dadosAtualizacao
      });

      const { senha, ...dados } = agroindustria;
      return res.json(dados);
    }

    const { nome, email, senha } = req.body;
    const data = { nome, email };
    if (senha) {
      data.senha = await bcrypt.hash(senha, 10);
    }
    
    const usuario = await prisma.usuario.update({
      where: { id: req.user.id },
      data
    });
    res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar dados' });
  }
});

// --- ROTAS DE ADMINISTRAÇÃO ---

// Criar Usuário (Apenas Admin)
app.post('/api/admin/usuarios', authenticateToken, async (req, res) => {
  if (req.user.cargo !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
  
  const { nome, email, senha, cargo } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha: hashedPassword, cargo }
    });
    res.json({ id: novoUsuario.id, email: novoUsuario.email });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Listar Usuários
app.get('/api/admin/usuarios', authenticateToken, async (req, res) => {
  if (req.user.cargo !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, cargo: true, created_at: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Atualizar Usuário
app.put('/api/admin/usuarios/:id', authenticateToken, async (req, res) => {
  if (req.user.cargo !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
  const { nome, email, cargo, senha } = req.body;
  
  try {
    const data = { nome, email, cargo };
    if (senha) {
      data.senha = await bcrypt.hash(senha, 10);
    }
    
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data
    });
    res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Deletar Usuário
app.delete('/api/admin/usuarios/:id', authenticateToken, async (req, res) => {
  if (req.user.cargo !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
  
  // Impedir deletar o próprio usuário logado
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: 'Não é possível deletar o próprio usuário' });
  }

  try {
    await prisma.usuario.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Listar Agroindústrias
app.get('/api/admin/agroindustrias', authenticateToken, async (req, res) => {
  try {
    const agroindustrias = await prisma.estabelecimento.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(agroindustrias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar agroindústrias' });
  }
});

// Detalhes da Agroindústria
app.get('/api/admin/agroindustrias/:id', authenticateToken, async (req, res) => {
  try {
    const agroindustria = await prisma.estabelecimento.findUnique({
      where: { id: req.params.id }
    });
    if (!agroindustria) return res.status(404).json({ error: 'Agroindústria não encontrada' });
    res.json(agroindustria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agroindústria' });
  }
});

// Atualizar Status
app.put('/api/admin/agroindustrias/:id/status', authenticateToken, async (req, res) => {
  const { status, observacao } = req.body;
  if (!STATUS_ESTAB.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const atual = await prisma.estabelecimento.findUnique({
      where: { id: req.params.id },
      select: { status: true }
    });
    if (!atual) return res.status(404).json({ error: 'Agroindústria não encontrada' });

    if (atual.status !== status && !canTransition(atual.status, status)) {
      return res.status(400).json({ error: `Transição inválida de ${atual.status} para ${status}` });
    }

    const agroindustria = await prisma.estabelecimento.update({
      where: { id: req.params.id },
      data: { status }
    });

    const protocolo = await prisma.protocolo.findFirst({
      where: { estabelecimento_id: req.params.id, tipo: 'REGISTRO_ESTABELECIMENTO' },
      orderBy: { created_at: 'desc' }
    });

    if (protocolo) {
      const protoStatusMap = {
        EM_ANALISE: 'EM_ANALISE',
        PENDENTE_AJUSTES: 'PENDENTE_AJUSTES',
        EM_CREDENCIAMENTO: 'EM_ANALISE',
        APROVADO: 'APROVADO',
        REPROVADO: 'REPROVADO'
      };
      await prisma.protocolo.update({
        where: { id: protocolo.id },
        data: {
          status_atual: protoStatusMap[status],
          eventos: {
            create: {
              status: protoStatusMap[status],
              observacao: observacao || `Mudança de status para ${status}`
            }
          }
        }
      });
    }

    res.json(agroindustria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Dashboard Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const total = await prisma.estabelecimento.count();
    const emAnalise = await prisma.estabelecimento.count({ where: { status: 'EM_ANALISE' } });
    const aprovados = await prisma.estabelecimento.count({ where: { status: 'APROVADO' } });
    
    // Agrupamento por atividade
    const porAtividade = await prisma.estabelecimento.groupBy({
        by: ['atividade_principal'],
        _count: {
            atividade_principal: true
        }
    });

    res.json({ total, emAnalise, aprovados, porAtividade });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar estatísticas' });
  }
});


// Schema de Validação (Espelho do Frontend)
const cadastroSchema = z.object({
  tipo_pessoa: z.enum(['FISICA', 'JURIDICA']).optional(),
  cnpj_cpf: z.string().min(11),
  razao_social: z.string().min(3),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  endereco: z.string().min(5),
  municipio: z.string().min(2),
  uf: z.string().length(2),
  cep: z.string().min(8),
  telefone: z.string().min(10),
  email: z.string().email(),
  atividade_principal: z.enum(['CARNE', 'LEITE', 'OVOS', 'MEL', 'PESCADO']),
  
  // Novos campos Passo 1
  agricultura_familiar: z.boolean().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  localizacao: z.string().optional(),
  produtos: z.string().optional(),
  
  // Passo 2
  possui_capacitacao: z.boolean().optional(),
  possui_assistencia_tecnica: z.boolean().optional(),
  possui_registro_anterior: z.boolean().optional(),
  
  // Passo 3
  compartilha_area_producao: z.boolean().optional(),
  
  // Passo 4
  resp_cadastro_nome: z.string().optional(),
  resp_cadastro_entidade: z.string().optional(),
  resp_cadastro_is_dono: z.boolean().optional(),
  ciente_requisitos: z.boolean().optional(),

  area_construida: z.number().max(250, "Área construída não pode exceder 250m² para Pequeno Porte"),
  resp_legal_nome: z.string().min(3),
  resp_legal_cpf: z.string().min(11),
  // Critérios de exclusão (devem ser false para aprovar)
  participa_outra_empresa: z.boolean(),
  possui_filial: z.boolean(),
  participa_capital_outra: z.boolean(),
  socio_outra_empresa_nao_beneficiada: z.boolean(),
  socio_administrador_outra: z.boolean(),
});

// Endpoint de Cadastro
app.post('/api/agroindustrias', async (req, res) => {
  try {
    const dados = cadastroSchema.parse(req.body);

    // Verificação de regras de negócio adicionais
    if (dados.participa_outra_empresa || 
        dados.possui_filial || 
        dados.participa_capital_outra || 
        dados.socio_outra_empresa_nao_beneficiada || 
        dados.socio_administrador_outra) {
      return res.status(400).json({ 
        error: "Critérios de elegibilidade não atendidos para Agroindústria de Pequeno Porte (Lei 12.387/2024)." 
      });
    }

    // Gerar senha padrão (hash)
    const hashedPassword = await bcrypt.hash('123mudar', 10);

    const novoEstabelecimento = await prisma.estabelecimento.create({
      data: {
        ...dados,
        senha: hashedPassword,
        primeiro_acesso: true,
        status: 'EM_ANALISE'
      }
    });

    const protocolo = await prisma.protocolo.create({
      data: {
        numero_protocolo: generateProtocolNumber(),
        estabelecimento_id: novoEstabelecimento.id,
        tipo: 'REGISTRO_ESTABELECIMENTO',
        status_atual: 'EM_ANALISE',
        eventos: {
          create: {
            status: 'EM_ANALISE',
            observacao: 'Cadastro inicial realizado'
          }
        }
      }
    });

    res.status(201).json({ ...novoEstabelecimento, protocolo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    
    // Erro de conexão com o banco (Prisma)
    if (error.code === 'P1001') {
      console.error("Erro de conexão com o banco de dados:", error);
      return res.status(503).json({ error: "Sistema indisponível: Não foi possível conectar ao banco de dados MySQL na porta 3306." });
    }

    console.error(error);
    res.status(500).json({ error: "Erro interno ao cadastrar agroindústria.", details: error.message });
  }
});

// Enviar Requerimento (Wizard)
app.post('/api/agroindustria/requerimento', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { responsaveis, documentos, ...dadosBasicos } = req.body;

  try {
    const responsaveisList = responsaveis || [];
    const documentosList = documentos || [];

    const result = await prisma.$transaction(async (tx) => {
      const updatedEstabelecimento = await tx.estabelecimento.update({
        where: { id: req.user.id },
        data: {
          ...dadosBasicos,
          status: 'EM_CREDENCIAMENTO',
          responsaveis: {
            deleteMany: {},
            create: responsaveisList.map(r => ({
              cpf: r.cpf,
              nome: r.nome,
              funcao: r.funcao,
              conselho: r.conselho
            }))
          },
          documentos: {
            deleteMany: {},
            create: documentosList.map(d => ({
              tipo: d.nome, 
              status: d.status === 'Enviado' ? 'ENVIADO' : 'PENDENTE',
              data_envio: d.status === 'Enviado' ? new Date() : null
            }))
          }
        }
      });

      const protocolo = await tx.protocolo.findFirst({
        where: { estabelecimento_id: req.user.id, tipo: 'REGISTRO_ESTABELECIMENTO' },
        orderBy: { created_at: 'desc' }
      });

      if (protocolo) {
        await tx.protocolo.update({
          where: { id: protocolo.id },
          data: {
            status_atual: 'EM_ANALISE',
            eventos: {
              create: {
                status: 'EM_ANALISE',
                observacao: 'Requerimento finalizado e enviado'
              }
            }
          }
        });
      }
      return updatedEstabelecimento;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar requerimento' });
  }
});

// Protocolos da Agroindústria
app.get('/api/agroindustria/protocolos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const protocolos = await prisma.protocolo.findMany({
      where: { estabelecimento_id: req.user.id },
      include: { eventos: { orderBy: { created_at: 'asc' } } },
      orderBy: { created_at: 'desc' }
    });
    res.json(protocolos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar protocolos' });
  }
});

// Produtos - Agroindústria
app.get('/api/agroindustria/produtos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const produtos = await prisma.produto.findMany({
      where: { estabelecimento_id: req.user.id },
      include: { categoria: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

app.post('/api/agroindustria/produtos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const produto = await prisma.produto.create({
      data: {
        estabelecimento_id: req.user.id,
        nome: req.body.nome,
        marca: req.body.marca || null,
        categoria_id: req.body.categoria_id || null,
        composicao: req.body.composicao || null,
        processo_fabricacao: req.body.processo_fabricacao || null,
        tipo_embalagem: req.body.tipo_embalagem || null,
        peso_volume: req.body.peso_volume || null,
        rotulo_url: req.body.rotulo_url || null,
        prazo_validade: req.body.prazo_validade || null,
        temperatura_conservacao: req.body.temperatura_conservacao || null
      }
    });

    await prisma.protocolo.create({
      data: {
        numero_protocolo: generateProtocolNumber(),
        estabelecimento_id: req.user.id,
        tipo: 'REGISTRO_PRODUTO',
        status_atual: 'EM_ANALISE',
        eventos: {
          create: {
            status: 'EM_ANALISE',
            observacao: `Produto cadastrado: ${produto.nome}`
          }
        }
      }
    });

    res.status(201).json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

app.put('/api/agroindustria/produtos/:id', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const atual = await prisma.produto.findUnique({ where: { id: req.params.id } });
    if (!atual || atual.estabelecimento_id !== req.user.id) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produto = await prisma.produto.update({
      where: { id: req.params.id },
      data: {
        nome: req.body.nome ?? atual.nome,
        marca: req.body.marca ?? atual.marca,
        categoria_id: req.body.categoria_id ?? atual.categoria_id,
        composicao: req.body.composicao ?? atual.composicao,
        processo_fabricacao: req.body.processo_fabricacao ?? atual.processo_fabricacao,
        tipo_embalagem: req.body.tipo_embalagem ?? atual.tipo_embalagem,
        peso_volume: req.body.peso_volume ?? atual.peso_volume,
        rotulo_url: req.body.rotulo_url ?? atual.rotulo_url,
        prazo_validade: req.body.prazo_validade ?? atual.prazo_validade,
        temperatura_conservacao: req.body.temperatura_conservacao ?? atual.temperatura_conservacao
      }
    });
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.delete('/api/agroindustria/produtos/:id', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const atual = await prisma.produto.findUnique({ where: { id: req.params.id } });
    if (!atual || atual.estabelecimento_id !== req.user.id) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    await prisma.produto.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

// Mapas mensais - Agroindústria
app.get('/api/agroindustria/mapas', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const mapas = await prisma.mapaMensal.findMany({
      where: { estabelecimento_id: req.user.id },
      include: { itens: true },
      orderBy: [{ ano_referencia: 'desc' }, { mes_referencia: 'desc' }]
    });
    res.json(mapas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar mapas' });
  }
});

app.post('/api/agroindustria/mapas', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  const { mes_referencia, ano_referencia, itens = [] } = req.body;
  try {
    const mapa = await prisma.$transaction(async (tx) => {
      const existente = await tx.mapaMensal.findFirst({
        where: { estabelecimento_id: req.user.id, mes_referencia, ano_referencia }
      });

      if (existente) {
        await tx.mapaItem.deleteMany({ where: { mapa_id: existente.id } });
        return tx.mapaMensal.update({
          where: { id: existente.id },
          data: {
            status: 'RASCUNHO',
            itens: {
              create: itens.map((i) => ({
                tipo_registro: i.tipo_registro,
                data_ocorrencia: new Date(i.data_ocorrencia),
                produto_id: i.produto_id || null,
                produto_nome: i.produto_nome || null,
                quantidade: i.quantidade ?? null,
                unidade_medida: i.unidade_medida || 'kg',
                lote: i.lote || null,
                origem_destino_info: i.origem_destino_info || null
              }))
            }
          },
          include: { itens: true }
        });
      }

      return tx.mapaMensal.create({
        data: {
          estabelecimento_id: req.user.id,
          mes_referencia,
          ano_referencia,
          status: 'RASCUNHO',
          itens: {
            create: itens.map((i) => ({
              tipo_registro: i.tipo_registro,
              data_ocorrencia: new Date(i.data_ocorrencia),
              produto_id: i.produto_id || null,
              produto_nome: i.produto_nome || null,
              quantidade: i.quantidade ?? null,
              unidade_medida: i.unidade_medida || 'kg',
              lote: i.lote || null,
              origem_destino_info: i.origem_destino_info || null
            }))
          }
        },
        include: { itens: true }
      });
    });

    res.status(201).json(mapa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar mapa mensal' });
  }
});

app.post('/api/agroindustria/mapas/:id/enviar', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const mapa = await prisma.mapaMensal.findUnique({ where: { id: req.params.id } });
    if (!mapa || mapa.estabelecimento_id !== req.user.id) {
      return res.status(404).json({ error: 'Mapa não encontrado' });
    }
    const atualizado = await prisma.mapaMensal.update({
      where: { id: req.params.id },
      data: { status: 'ENVIADO', data_envio: new Date() }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mapa' });
  }
});

// Administração - Protocolos, vistorias, mapas, títulos, documentos
app.get('/api/admin/protocolos', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const protocolos = await prisma.protocolo.findMany({
      include: {
        estabelecimento: { select: { id: true, razao_social: true, cnpj_cpf: true } },
        eventos: { orderBy: { created_at: 'asc' } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(protocolos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar protocolos' });
  }
});

app.get('/api/checklists/modelos', authenticateToken, async (req, res) => {
  try {
    const tipo = req.query.tipo;
    const modelosBrutos = await prisma.checklistModelo.findMany({
      where: {
        ativo: true,
        titulo: { not: { startsWith: 'Checklist SIAPP -' } },
        ...(tipo ? { tipo_industria: tipo } : {})
      },
      include: { itens: { orderBy: { ordem: 'asc' } } },
      orderBy: { created_at: 'desc' }
    });
    const porTitulo = new Map();
    for (const modelo of modelosBrutos) {
      const atual = porTitulo.get(modelo.titulo);
      if (!atual || modelo.itens.length > atual.itens.length) {
        porTitulo.set(modelo.titulo, modelo);
      }
    }
    res.json(Array.from(porTitulo.values()));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar modelos de checklist' });
  }
});

app.get('/api/agroindustria/checklist/modelos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: req.user.id },
      select: { atividade_principal: true }
    });
    const modelosBrutos = await prisma.checklistModelo.findMany({
      where: {
        ativo: true,
        titulo: { not: { startsWith: 'Checklist SIAPP -' } },
        OR: [
          { tipo_industria: estabelecimento?.atividade_principal },
          { tipo_industria: 'LEITE' }
        ]
      },
      include: { itens: { orderBy: { ordem: 'asc' } } },
      orderBy: { created_at: 'desc' }
    });
    const porTitulo = new Map();
    for (const modelo of modelosBrutos) {
      const atual = porTitulo.get(modelo.titulo);
      if (!atual || modelo.itens.length > atual.itens.length) {
        porTitulo.set(modelo.titulo, modelo);
      }
    }
    res.json(Array.from(porTitulo.values()));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar modelos de checklist' });
  }
});

app.get('/api/agroindustria/checklist/preenchimentos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  const modeloId = req.query.modelo_id;
  try {
    const preenchimentos = await prisma.checklistPreenchimento.findMany({
      where: {
        estabelecimento_id: req.user.id,
        ...(modeloId ? { checklist_modelo_id: String(modeloId) } : {})
      },
      include: {
        checklist_modelo: { select: { id: true, titulo: true, versao: true } },
        itens: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(preenchimentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar preenchimentos de checklist' });
  }
});

app.post('/api/agroindustria/checklist/preenchimentos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });

  const { preenchimento_id, checklist_modelo_id, status = 'RASCUNHO', respostas = [] } = req.body;
  if (!checklist_modelo_id) return res.status(400).json({ error: 'checklist_modelo_id é obrigatório' });

  const invalidas = respostas.find((r) => !CHECKLIST_RESPOSTAS_VALIDAS.includes(r.resposta));
  if (invalidas) return res.status(400).json({ error: 'Resposta de checklist inválida' });

  try {
    const salvo = await prisma.$transaction(async (tx) => {
      if (preenchimento_id) {
        const atual = await tx.checklistPreenchimento.findUnique({ where: { id: preenchimento_id } });
        if (!atual || atual.estabelecimento_id !== req.user.id) {
          throw new Error('NOT_FOUND');
        }
        await tx.checklistPreenchimentoItem.deleteMany({ where: { preenchimento_id } });
        return tx.checklistPreenchimento.update({
          where: { id: preenchimento_id },
          data: {
            status,
            itens: {
              create: respostas.map((r) => ({
                item_id: r.item_id,
                resposta: r.resposta,
                observacao: r.observacao || null
              }))
            }
          },
          include: { itens: true, checklist_modelo: true }
        });
      }

      return tx.checklistPreenchimento.create({
        data: {
          estabelecimento_id: req.user.id,
          checklist_modelo_id,
          status,
          itens: {
            create: respostas.map((r) => ({
              item_id: r.item_id,
              resposta: r.resposta,
              observacao: r.observacao || null
            }))
          }
        },
        include: { itens: true, checklist_modelo: true }
      });
    });

    res.status(201).json(salvo);
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Preenchimento não encontrado' });
    res.status(500).json({ error: 'Erro ao salvar checklist' });
  }
});

app.post('/api/admin/checklists/modelos', authenticateToken, async (req, res) => {
  if (!ADMIN_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  const { titulo, tipo_industria, versao, itens = [] } = req.body;
  try {
    const modelo = await prisma.checklistModelo.create({
      data: {
        titulo,
        tipo_industria,
        versao,
        itens: {
          create: itens.map((item, idx) => ({
            grupo: item.grupo || 'GERAL',
            texto_pergunta: item.texto_pergunta,
            ordem: item.ordem || idx + 1,
            peso_risco: item.peso_risco || null
          }))
        }
      },
      include: { itens: true }
    });
    res.status(201).json(modelo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar modelo de checklist' });
  }
});

app.get('/api/admin/vistorias', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const vistorias = await prisma.vistoria.findMany({
      include: {
        estabelecimento: { select: { id: true, razao_social: true, municipio: true } },
        fiscal: { select: { id: true, nome: true, email: true } },
        checklist_modelo: { select: { id: true, titulo: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(vistorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar vistorias' });
  }
});

app.post('/api/admin/vistorias', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  const {
    estabelecimento_id,
    fiscal_user_id,
    checklist_modelo_id,
    tipo_vistoria = 'PREVIA',
    respostas = [],
    geolocalizacao_checkin,
    dados_formulario = null
  } = req.body;
  try {
    const fiscalResponsavelId = req.user.cargo === 'FISCAL' ? req.user.id : fiscal_user_id;
    if (req.user.cargo === 'FISCAL' && fiscal_user_id && fiscal_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Fiscal so pode agendar vistoria para si mesmo' });
    }
    if (!fiscalResponsavelId) {
      return res.status(400).json({ error: 'fiscal_user_id e obrigatorio' });
    }

    const vistoria = await prisma.vistoria.create({
      data: {
        estabelecimento_id,
        fiscal_user_id: fiscalResponsavelId,
        checklist_modelo_id: checklist_modelo_id || null,
        tipo_vistoria,
        geolocalizacao_checkin: geolocalizacao_checkin || null,
        dados_formulario,
        respostas: {
          create: respostas.map((r) => ({
            item_id: r.item_id,
            resposta: r.resposta,
            opcoes_marcadas: r.opcoes_marcadas || null,
            observacao: r.observacao || null
          }))
        }
      },
      include: { respostas: true }
    });
    res.status(201).json(vistoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar vistoria' });
  }
});

app.get('/api/admin/vistorias/:id', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const vistoria = await prisma.vistoria.findUnique({
      where: { id: req.params.id },
      include: {
        estabelecimento: true,
        fiscal: { select: { id: true, nome: true, email: true } },
        checklist_modelo: { include: { itens: { orderBy: { ordem: 'asc' } } } },
        respostas: true,
        fotos: true,
        documentos: true
      }
    });
    if (!vistoria) return res.status(404).json({ error: 'Vistoria não encontrada' });
    if (req.user.cargo === 'FISCAL' && vistoria.fiscal_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado a esta vistoria' });
    }
    res.json(vistoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vistoria' });
  }
});

app.put('/api/admin/vistorias/:id/finalizar', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  const { resultado, parecer_final, pontuacao_final, respostas = [], dados_formulario = null } = req.body;
  try {
    const vistoria = await prisma.$transaction(async (tx) => {
      const atual = await tx.vistoria.findUnique({ where: { id: req.params.id } });
      if (!atual) throw new Error('NOT_FOUND');
      if (req.user.cargo === 'FISCAL' && atual.fiscal_user_id !== req.user.id) throw new Error('FORBIDDEN');

      await tx.vistoriaResposta.deleteMany({ where: { vistoria_id: req.params.id } });

      return tx.vistoria.update({
        where: { id: req.params.id },
        data: {
          resultado,
          parecer_final: parecer_final || null,
          pontuacao_final: pontuacao_final ?? null,
          dados_formulario,
          respostas: {
            create: respostas.map((r) => ({
              item_id: r.item_id,
              resposta: r.resposta,
              opcoes_marcadas: r.opcoes_marcadas || null,
              observacao: r.observacao || null
            }))
          }
        },
        include: { estabelecimento: true, respostas: true }
      });
    });

    if (resultado === 'APROVADO') {
      await prisma.estabelecimento.update({
        where: { id: vistoria.estabelecimento_id },
        data: { status: 'APROVADO' }
      });
    }

    res.json(vistoria);
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Vistoria nao encontrada' });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ error: 'Acesso negado a esta vistoria' });
    res.status(500).json({ error: 'Erro ao finalizar vistoria' });
  }
});

app.get('/api/admin/mapas', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const mapas = await prisma.mapaMensal.findMany({
      include: {
        estabelecimento: { select: { id: true, razao_social: true, municipio: true } },
        itens: true
      },
      orderBy: [{ ano_referencia: 'desc' }, { mes_referencia: 'desc' }]
    });
    res.json(mapas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar mapas' });
  }
});

app.post('/api/admin/documentos-legais', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const doc = await prisma.documentoLegal.create({
      data: {
        vistoria_id: req.body.vistoria_id || null,
        estabelecimento_id: req.body.estabelecimento_id || null,
        tipo: req.body.tipo,
        conteudo_gerado: req.body.conteudo_gerado || null,
        arquivo_url: req.body.arquivo_url || null,
        prazo_cumprimento: req.body.prazo_cumprimento ? new Date(req.body.prazo_cumprimento) : null,
        status_cumprimento: req.body.status_cumprimento || null
      }
    });
    res.status(201).json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar documento legal' });
  }
});

app.get('/api/admin/documentos-legais', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const docs = await prisma.documentoLegal.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar documentos legais' });
  }
});

app.post('/api/admin/titulos/emitir', authenticateToken, async (req, res) => {
  if (!ADMIN_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  const { estabelecimento_id, data_validade, arquivo_pdf_assinado } = req.body;
  try {
    const vistoriaAprovada = await prisma.vistoria.findFirst({
      where: { estabelecimento_id, resultado: 'APROVADO' },
      orderBy: { created_at: 'desc' }
    });
    if (!vistoriaAprovada) {
      return res.status(400).json({ error: 'Não é possível emitir título sem vistoria aprovada.' });
    }

    const numero_registro = `SIAPP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const titulo = await prisma.registroTitulo.create({
      data: {
        estabelecimento_id,
        numero_registro,
        data_concessao: new Date(),
        data_validade: new Date(data_validade),
        arquivo_pdf_assinado: arquivo_pdf_assinado || null
      }
    });

    await prisma.estabelecimento.update({
      where: { id: estabelecimento_id },
      data: { status: 'APROVADO' }
    });

    res.status(201).json(titulo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao emitir título' });
  }
});

app.get('/api/admin/titulos', authenticateToken, async (req, res) => {
  if (!STAFF_ROLES.includes(req.user.cargo)) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const titulos = await prisma.registroTitulo.findMany({
      include: { estabelecimento: { select: { id: true, razao_social: true, cnpj_cpf: true } } },
      orderBy: { created_at: 'desc' }
    });
    res.json(titulos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar títulos' });
  }
});

// Painel Agro - consultas de vistoria e atos
app.get('/api/agroindustria/vistorias', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const vistorias = await prisma.vistoria.findMany({
      where: { estabelecimento_id: req.user.id },
      include: {
        fiscal: { select: { nome: true } },
        documentos: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(vistorias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar vistorias' });
  }
});

app.get('/api/agroindustria/documentos-legais', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const docs = await prisma.documentoLegal.findMany({
      where: { estabelecimento_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar documentos legais' });
  }
});

app.get('/api/agroindustria/documentos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const docs = await prisma.documento.findMany({
      where: { estabelecimento_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar documentos' });
  }
});

app.post('/api/agroindustria/documentos', authenticateToken, async (req, res) => {
  if (req.user.tipo !== 'agroindustria') return res.status(403).json({ error: 'Acesso negado' });
  const { tipo, url } = req.body;
  try {
    const doc = await prisma.documento.create({
      data: {
        estabelecimento_id: req.user.id,
        tipo: tipo || 'OUTRO',
        url: url || null,
        status: url ? 'ENVIADO' : 'PENDENTE',
        data_envio: url ? new Date() : null
      }
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar documento' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Rota de Upload
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  
  // Retorna a URL relativa do arquivo
  res.json({ 
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
