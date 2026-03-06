const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Iniciando população do banco de dados...');

    // 1. Limpar tabelas existentes (ordem reversa de dependência)
    console.log('Limpando tabelas antigas...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE maquinas');
    await connection.query('TRUNCATE TABLE atendimentos');
    await connection.query('TRUNCATE TABLE tipos_atendimento');
    await connection.query('TRUNCATE TABLE propriedades');
    await connection.query('TRUNCATE TABLE enderecos_produtor');
    await connection.query('TRUNCATE TABLE produtores');
    await connection.query('TRUNCATE TABLE usuarios');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Criar Usuários (Admin e Técnico)
    console.log('Criando usuários...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Admin do município 1234567
    await connection.execute(`
      INSERT INTO usuarios (nome, email, senha_hash, perfil, codigo_ibge, ativo) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Administrador', 'admin@sgaf.com', hashedPassword, 'admin', '1234567', true]);

    // Técnico do município 1234567
    const [tecnicoResult] = await connection.execute(`
      INSERT INTO usuarios (nome, email, senha_hash, perfil, codigo_ibge, ativo) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Técnico João', 'joao@sgaf.com', hashedPassword, 'tecnico', '1234567', true]);
    
    const tecnicoId = tecnicoResult.insertId;

    // 3. Criar Produtores
    console.log('Criando produtores...');
    const produtoresData = [
      ['José da Silva', '111.111.111-11', 'Comunidade do Sol', '1234567'],
      ['Maria Oliveira', '222.222.222-22', 'Bairro das Flores', '1234567'],
      ['Antônio Santos', '333.333.333-33', 'Comunidade Verde', '1234567'],
      ['Ana Pereira', '444.444.444-44', 'Bairro Alto', '1234567'],
      ['Pedro Costa', '555.555.555-55', 'Comunidade do Rio', '1234567']
    ];

    const produtorIds = [];
    for (const prod of produtoresData) {
      // Inserir produtor
      const [result] = await connection.execute(`
        INSERT INTO produtores (nome, cpf, codigo_ibge, telefone)
        VALUES (?, ?, ?, '99999-9999')
      `, [prod[0], prod[1], prod[3]]);
      
      const produtorId = result.insertId;
      produtorIds.push(produtorId);

      // Inserir endereço
      await connection.execute(`
        INSERT INTO enderecos_produtor (produtor_id, logradouro, bairro, cidade, cep)
        VALUES (?, ?, ?, 'Cidade Exemplo', '00000-000')
      `, [produtorId, 'Rua Principal', prod[2]]);
    }

    // 4. Criar Propriedades
    console.log('Criando propriedades...');
    for (let i = 0; i < produtorIds.length; i++) {
      await connection.execute(`
        INSERT INTO propriedades (produtor_id, nome, area_total, codigo_ibge)
        VALUES (?, ?, ?, ?)
      `, [produtorIds[i], `Propriedade ${i+1}`, (Math.random() * 50 + 5).toFixed(2), '1234567']);
    }

    // 5. Criar Atendimentos
    console.log('Criando atendimentos...');
    const motivos = ['Assistência Técnica', 'Visita de Rotina', 'Entrega de Insumos', 'Análise de Solo', 'Vistoria'];
    
    // Inserir tipos de atendimento
    const tiposAtendimentoIds = [];
    for (const motivo of motivos) {
      const [result] = await connection.execute('INSERT INTO tipos_atendimento (descricao) VALUES (?)', [motivo]);
      tiposAtendimentoIds.push(result.insertId);
    }

    for (let i = 0; i < 15; i++) {
      const produtorId = produtorIds[Math.floor(Math.random() * produtorIds.length)];
      const dataVisita = new Date();
      dataVisita.setDate(dataVisita.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 dias
      const tipoId = tiposAtendimentoIds[Math.floor(Math.random() * tiposAtendimentoIds.length)];

      await connection.execute(`
        INSERT INTO atendimentos (produtor_id, tipo_atendimento_id, data_atendimento, descricao, codigo_ibge)
        VALUES (?, ?, ?, ?, ?)
      `, [
        produtorId, 
        tipoId, 
        dataVisita, 
        'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.',
        '1234567'
      ]);
    }

    // 6. Criar Máquinas
    console.log('Criando máquinas...');
    const maquinas = [
      ['Trator John Deere', 'Modelo A', 2020, 'Operacional'],
      ['Trator Massey Ferguson', 'Modelo B', 2018, 'Manutenção'],
      ['Plantadeira', 'Modelo C', 2021, 'Operacional'],
      ['Colheitadeira', 'Modelo D', 2019, 'Operacional'],
      ['Caminhão Pipa', 'Modelo E', 2022, 'Operacional']
    ];

    for (const maq of maquinas) {
      await connection.execute(`
        INSERT INTO maquinas (nome, modelo, ano, status, codigo_ibge)
        VALUES (?, ?, ?, ?, ?)
      `, [...maq, '1234567']);
    }

    console.log('Banco de dados populado com sucesso!');
    console.log('Login Admin: admin@sgaf.com / 123456');
    console.log('Login Técnico: joao@sgaf.com / 123456');

  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

seedDatabase();
