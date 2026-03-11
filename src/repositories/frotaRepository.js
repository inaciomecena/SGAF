const pool = require('../config/database');

const frotaRepository = {
  ensureSchema: async () => {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS frota_veiculos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_ibge VARCHAR(10) NOT NULL,
        placa VARCHAR(20) NOT NULL,
        modelo VARCHAR(120) NOT NULL,
        marca VARCHAR(120) NULL,
        ano INT NULL,
        tipo VARCHAR(80) NULL,
        odometro_atual INT NOT NULL DEFAULT 0,
        status VARCHAR(40) NOT NULL DEFAULT 'disponivel',
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_frota_veiculos_ibge_placa (codigo_ibge, placa),
        KEY idx_frota_veiculos_codigo_ibge (codigo_ibge)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS frota_abastecimentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        veiculo_id INT NOT NULL,
        motorista_id INT NULL,
        data DATE NOT NULL,
        litros DECIMAL(10,2) NOT NULL,
        valor_total DECIMAL(14,2) NOT NULL,
        odometro INT NOT NULL,
        posto VARCHAR(180) NULL,
        tipo_combustivel VARCHAR(60) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_frota_abastecimentos_veiculo_id (veiculo_id),
        KEY idx_frota_abastecimentos_data (data)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS atendimento_transporte (
        id INT AUTO_INCREMENT PRIMARY KEY,
        atendimento_id INT NOT NULL,
        veiculo_id INT NOT NULL,
        km_saida INT NULL,
        km_chegada INT NULL,
        km_percorrido INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_atendimento_transporte_atendimento (atendimento_id),
        KEY idx_atendimento_transporte_veiculo_id (veiculo_id)
      )
    `);
  },

  // Veículos
  listarVeiculos: async (codigoIbge) => {
    const [rows] = await pool.execute(
      'SELECT * FROM frota_veiculos WHERE codigo_ibge = ? AND ativo = 1 ORDER BY modelo, placa',
      [codigoIbge]
    );
    return rows;
  },

  getVeiculoById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM frota_veiculos WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  criarVeiculo: async (veiculo) => {
    const { codigo_ibge, placa, modelo, marca, ano, tipo, odometro_atual, status } = veiculo;
    const [result] = await pool.execute(
      `INSERT INTO frota_veiculos (codigo_ibge, placa, modelo, marca, ano, tipo, odometro_atual, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_ibge, placa, modelo, marca, ano, tipo, odometro_atual, status || 'disponivel']
    );
    return result.insertId;
  },

  atualizarVeiculo: async (id, veiculo) => {
    const { placa, modelo, marca, ano, tipo, status } = veiculo;
    await pool.execute(
      `UPDATE frota_veiculos 
       SET placa = ?, modelo = ?, marca = ?, ano = ?, tipo = ?, status = ?
       WHERE id = ?`,
      [placa, modelo, marca, ano, tipo, status, id]
    );
  },
  
  atualizarOdometro: async (id, odometro) => {
    await pool.execute(
      'UPDATE frota_veiculos SET odometro_atual = ? WHERE id = ?',
      [odometro, id]
    );
  },

  removerVeiculo: async (id) => {
    // Soft delete
    await pool.execute(
      'UPDATE frota_veiculos SET ativo = 0 WHERE id = ?',
      [id]
    );
  },

  // Abastecimentos
  listarAbastecimentos: async (veiculoId) => {
    const [rows] = await pool.execute(
      `SELECT a.*, u.nome as motorista_nome 
       FROM frota_abastecimentos a
       LEFT JOIN usuarios u ON a.motorista_id = u.id
       WHERE a.veiculo_id = ? 
       ORDER BY a.data DESC`,
      [veiculoId]
    );
    return rows;
  },

  registrarAbastecimento: async (abastecimento) => {
    const { veiculo_id, motorista_id, data, litros, valor_total, odometro, posto, tipo_combustivel } = abastecimento;
    const [result] = await pool.execute(
      `INSERT INTO frota_abastecimentos (veiculo_id, motorista_id, data, litros, valor_total, odometro, posto, tipo_combustivel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [veiculo_id, motorista_id, data, litros, valor_total, odometro, posto, tipo_combustivel]
    );
    return result.insertId;
  },
  
  // Transporte (Vínculo com Atendimento)
  vincularAtendimento: async (transporte) => {
    const { atendimento_id, veiculo_id, km_saida, km_chegada, km_percorrido } = transporte;
    const [result] = await pool.execute(
      `INSERT INTO atendimento_transporte (atendimento_id, veiculo_id, km_saida, km_chegada, km_percorrido)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         veiculo_id = VALUES(veiculo_id),
         km_saida = VALUES(km_saida),
         km_chegada = VALUES(km_chegada),
         km_percorrido = VALUES(km_percorrido)`,
      [atendimento_id, veiculo_id, km_saida, km_chegada, km_percorrido]
    );
    return result.insertId;
  },

  getTransporteByAtendimentoId: async (atendimentoId) => {
    const [rows] = await pool.execute(
      `SELECT t.*, v.modelo, v.placa 
       FROM atendimento_transporte t
       JOIN frota_veiculos v ON t.veiculo_id = v.id
       WHERE t.atendimento_id = ?`,
      [atendimentoId]
    );
    return rows[0];
  }
};

module.exports = frotaRepository;
