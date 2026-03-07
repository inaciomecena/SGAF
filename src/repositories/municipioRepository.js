const pool = require('../config/database');

class MunicipioRepository {
  async ensureMeusDadosSchema() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS secretaria_municipio_dados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_ibge VARCHAR(10) NOT NULL UNIQUE,
        nome_secretaria VARCHAR(180) NOT NULL,
        endereco VARCHAR(180) NOT NULL,
        numero INT NULL,
        bairro VARCHAR(120) NOT NULL,
        cep VARCHAR(10) NOT NULL,
        email VARCHAR(150) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        responsavel_nome VARCHAR(180) NOT NULL,
        responsavel_cargo VARCHAR(120) NOT NULL,
        responsavel_telefone VARCHAR(20) NOT NULL,
        responsavel_email VARCHAR(150) NOT NULL,
        qtd_servidores INT NOT NULL,
        qtd_servidores_concursados INT NOT NULL,
        possui_fundo_municipal BOOLEAN NOT NULL,
        fundo_tipo_publicacao VARCHAR(40) NULL,
        fundo_numero_publicacao VARCHAR(120) NULL,
        fundo_data_publicacao DATE NULL,
        fundo_orcamento_anual DECIMAL(14,2) NULL,
        fundo_percentual_orcamento INT NULL,
        possui_escritorio_empaer BOOLEAN NOT NULL,
        projetos_com_empaer BOOLEAN NOT NULL,
        projetos_empaer_texto TEXT NULL,
        servidor_municipio_cedido_empaer BOOLEAN NOT NULL,
        servidores_municipio_cedidos TEXT NULL,
        servidor_empaer_cedido_municipio BOOLEAN NOT NULL,
        servidores_empaer_cedidos TEXT NULL,
        possui_escritorio_indea BOOLEAN NOT NULL,
        possui_unidade_senar BOOLEAN NOT NULL,
        servicos_prestados_json LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM municipios WHERE ativo = TRUE');
    return rows;
  }

  async findByCodigoIbge(codigoIbge) {
    const [rows] = await pool.execute('SELECT * FROM municipios WHERE codigo_ibge = ?', [codigoIbge]);
    return rows[0];
  }

  async create(municipioData) {
    const { codigo_ibge, nome, estado, regiao } = municipioData;
    const [result] = await pool.execute(
      'INSERT INTO municipios (codigo_ibge, nome, estado, regiao) VALUES (?, ?, ?, ?)',
      [codigo_ibge, nome, estado, regiao]
    );
    return result.insertId;
  }

  async update(id, municipioData) {
    const { nome, estado, regiao } = municipioData;
    await pool.execute(
      'UPDATE municipios SET nome = ?, estado = ?, regiao = ? WHERE id = ?',
      [nome, estado, regiao, id]
    );
  }

  async delete(id) {
    await pool.execute('UPDATE municipios SET ativo = FALSE WHERE id = ?', [id]);
  }

  async findMeusDadosByCodigoIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM secretaria_municipio_dados WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows[0];
  }

  async upsertMeusDados(codigoIbge, dados) {
    const payload = [
      codigoIbge,
      dados.nome_secretaria,
      dados.endereco,
      dados.numero,
      dados.bairro,
      dados.cep,
      dados.email,
      dados.telefone,
      dados.responsavel_nome,
      dados.responsavel_cargo,
      dados.responsavel_telefone,
      dados.responsavel_email,
      dados.qtd_servidores,
      dados.qtd_servidores_concursados,
      dados.possui_fundo_municipal,
      dados.fundo_tipo_publicacao,
      dados.fundo_numero_publicacao,
      dados.fundo_data_publicacao,
      dados.fundo_orcamento_anual,
      dados.fundo_percentual_orcamento,
      dados.possui_escritorio_empaer,
      dados.projetos_com_empaer,
      dados.projetos_empaer_texto,
      dados.servidor_municipio_cedido_empaer,
      dados.servidores_municipio_cedidos,
      dados.servidor_empaer_cedido_municipio,
      dados.servidores_empaer_cedidos,
      dados.possui_escritorio_indea,
      dados.possui_unidade_senar,
      dados.servicos_prestados_json
    ];

    await pool.execute(
      `INSERT INTO secretaria_municipio_dados (
        codigo_ibge, nome_secretaria, endereco, numero, bairro, cep, email, telefone,
        responsavel_nome, responsavel_cargo, responsavel_telefone, responsavel_email,
        qtd_servidores, qtd_servidores_concursados, possui_fundo_municipal,
        fundo_tipo_publicacao, fundo_numero_publicacao, fundo_data_publicacao,
        fundo_orcamento_anual, fundo_percentual_orcamento,
        possui_escritorio_empaer, projetos_com_empaer, projetos_empaer_texto,
        servidor_municipio_cedido_empaer, servidores_municipio_cedidos,
        servidor_empaer_cedido_municipio, servidores_empaer_cedidos,
        possui_escritorio_indea, possui_unidade_senar, servicos_prestados_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nome_secretaria = VALUES(nome_secretaria),
        endereco = VALUES(endereco),
        numero = VALUES(numero),
        bairro = VALUES(bairro),
        cep = VALUES(cep),
        email = VALUES(email),
        telefone = VALUES(telefone),
        responsavel_nome = VALUES(responsavel_nome),
        responsavel_cargo = VALUES(responsavel_cargo),
        responsavel_telefone = VALUES(responsavel_telefone),
        responsavel_email = VALUES(responsavel_email),
        qtd_servidores = VALUES(qtd_servidores),
        qtd_servidores_concursados = VALUES(qtd_servidores_concursados),
        possui_fundo_municipal = VALUES(possui_fundo_municipal),
        fundo_tipo_publicacao = VALUES(fundo_tipo_publicacao),
        fundo_numero_publicacao = VALUES(fundo_numero_publicacao),
        fundo_data_publicacao = VALUES(fundo_data_publicacao),
        fundo_orcamento_anual = VALUES(fundo_orcamento_anual),
        fundo_percentual_orcamento = VALUES(fundo_percentual_orcamento),
        possui_escritorio_empaer = VALUES(possui_escritorio_empaer),
        projetos_com_empaer = VALUES(projetos_com_empaer),
        projetos_empaer_texto = VALUES(projetos_empaer_texto),
        servidor_municipio_cedido_empaer = VALUES(servidor_municipio_cedido_empaer),
        servidores_municipio_cedidos = VALUES(servidores_municipio_cedidos),
        servidor_empaer_cedido_municipio = VALUES(servidor_empaer_cedido_municipio),
        servidores_empaer_cedidos = VALUES(servidores_empaer_cedidos),
        possui_escritorio_indea = VALUES(possui_escritorio_indea),
        possui_unidade_senar = VALUES(possui_unidade_senar),
        servicos_prestados_json = VALUES(servicos_prestados_json)`,
      payload
    );
  }
}

module.exports = new MunicipioRepository();
