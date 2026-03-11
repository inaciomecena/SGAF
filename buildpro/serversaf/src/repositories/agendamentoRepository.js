const pool = require('../config/database');

class AgendamentoRepository {
  async findAllByIbge(codigoIbge) {
    // Join complexo para trazer nomes
    const [rows] = await pool.execute(
      `SELECT a.*, m.nome as maquina_nome, p.nome as produtor_nome, o.nome as operador_nome
       FROM agendamentos_maquinas a
       JOIN maquinas m ON a.maquina_id = m.id
       JOIN produtores p ON a.produtor_id = p.id
       LEFT JOIN operadores o ON a.operador_id = o.id
       WHERE m.codigo_ibge = ?
       ORDER BY a.data_inicio DESC`,
      [codigoIbge]
    );
    return rows;
  }

  async create(data) {
    const { maquina_id, produtor_id, data_inicio, data_fim, operador_id } = data;
    const [result] = await pool.execute(
      'INSERT INTO agendamentos_maquinas (maquina_id, produtor_id, data_inicio, data_fim, operador_id) VALUES (?, ?, ?, ?, ?)',
      [maquina_id, produtor_id, data_inicio, data_fim, operador_id]
    );
    return result.insertId;
  }

  async registrarHoras(agendamentoId, horas) {
    await pool.execute(
      'INSERT INTO horas_maquina (agendamento_id, horas_trabalhadas) VALUES (?, ?)',
      [agendamentoId, horas]
    );
  }
  
  async getHoras(agendamentoId) {
    const [rows] = await pool.execute(
      'SELECT * FROM horas_maquina WHERE agendamento_id = ?',
      [agendamentoId]
    );
    return rows;
  }
}

module.exports = new AgendamentoRepository();
