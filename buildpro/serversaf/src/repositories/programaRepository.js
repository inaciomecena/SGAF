const pool = require('../config/database');

class ProgramaRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM programas WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows;
  }

  async create(data) {
    const { codigo_ibge, nome, orgao, data_inicio, data_fim, orcamento } = data;
    const [result] = await pool.execute(
      'INSERT INTO programas (codigo_ibge, nome, orgao, data_inicio, data_fim, orcamento) VALUES (?, ?, ?, ?, ?, ?)',
      [codigo_ibge, nome, orgao, data_inicio, data_fim, orcamento]
    );
    return result.insertId;
  }

  async registrarBeneficiario(data) {
    const { programa_id, produtor_id, beneficio, valor } = data;
    const [result] = await pool.execute(
      'INSERT INTO programa_produtores (programa_id, produtor_id, beneficio, valor) VALUES (?, ?, ?, ?)',
      [programa_id, produtor_id, beneficio, valor]
    );
    return result.insertId;
  }

  async listarBeneficiarios(programaId) {
    const [rows] = await pool.execute(
      `SELECT pp.*, p.nome as produtor_nome 
       FROM programa_produtores pp
       JOIN produtores p ON pp.produtor_id = p.id
       WHERE pp.programa_id = ?`,
      [programaId]
    );
    return rows;
  }
}

module.exports = new ProgramaRepository();
