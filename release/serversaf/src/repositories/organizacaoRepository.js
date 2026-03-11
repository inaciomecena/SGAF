const pool = require('../config/database');

class AssociacaoRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM associacoes WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows;
  }

  async create(data) {
    const { codigo_ibge, nome, tipo, telefone } = data;
    const [result] = await pool.execute(
      'INSERT INTO associacoes (codigo_ibge, nome, tipo, telefone) VALUES (?, ?, ?, ?)',
      [codigo_ibge, nome, tipo, telefone]
    );
    return result.insertId;
  }
}

class CooperativaRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM cooperativas WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows;
  }

  async create(data) {
    const { codigo_ibge, nome, cnpj, telefone } = data;
    const [result] = await pool.execute(
      'INSERT INTO cooperativas (codigo_ibge, nome, cnpj, telefone) VALUES (?, ?, ?, ?)',
      [codigo_ibge, nome, cnpj, telefone]
    );
    return result.insertId;
  }
}

module.exports = {
  associacaoRepository: new AssociacaoRepository(),
  cooperativaRepository: new CooperativaRepository()
};
