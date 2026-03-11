const pool = require('../config/database');

const frotaRepository = {
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
       VALUES (?, ?, ?, ?, ?)`,
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
