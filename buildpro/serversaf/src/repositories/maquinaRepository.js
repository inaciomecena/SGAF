const pool = require('../config/database');

class MaquinaRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM maquinas WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows;
  }

  async findById(id, codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM maquinas WHERE id = ? AND codigo_ibge = ?',
      [id, codigoIbge]
    );
    return rows[0];
  }

  async create(data) {
    const { codigo_ibge, nome, modelo, ano, status } = data;
    const [result] = await pool.execute(
      'INSERT INTO maquinas (codigo_ibge, nome, modelo, ano, status) VALUES (?, ?, ?, ?, ?)',
      [codigo_ibge, nome, modelo, ano, status || 'DISPONIVEL']
    );
    return result.insertId;
  }

  async update(id, codigoIbge, data) {
    const { nome, modelo, ano, status } = data;
    await pool.execute(
      'UPDATE maquinas SET nome = ?, modelo = ?, ano = ?, status = ? WHERE id = ? AND codigo_ibge = ?',
      [nome, modelo, ano, status, id, codigoIbge]
    );
  }

  async delete(id, codigoIbge) {
    // Soft delete ou apenas remover se não houver vínculos? 
    // Por simplicidade, vamos remover, mas idealmente seria soft delete.
    // Como não tem campo 'ativo', vamos assumir remoção física com verificação de constraints no DB.
    await pool.execute('DELETE FROM maquinas WHERE id = ? AND codigo_ibge = ?', [id, codigoIbge]);
  }

  // Operadores
  async findAllOperadores(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM operadores WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows;
  }

  async createOperador(data) {
    const { codigo_ibge, nome, telefone } = data;
    const [result] = await pool.execute(
      'INSERT INTO operadores (codigo_ibge, nome, telefone) VALUES (?, ?, ?)',
      [codigo_ibge, nome, telefone]
    );
    return result.insertId;
  }

  // Manutenções
  async findManutencoesByMaquina(maquinaId) {
    const [rows] = await pool.execute(
      'SELECT * FROM manutencoes_maquinas WHERE maquina_id = ? ORDER BY data DESC',
      [maquinaId]
    );
    return rows;
  }

  async createManutencao(dados) {
    const { maquina_id, descricao, data, custo } = dados;
    const [result] = await pool.execute(
      'INSERT INTO manutencoes_maquinas (maquina_id, descricao, data, custo) VALUES (?, ?, ?, ?)',
      [maquina_id, descricao, data, custo]
    );
    return result.insertId;
  }
}

module.exports = new MaquinaRepository();
