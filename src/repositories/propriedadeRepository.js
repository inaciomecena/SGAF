const pool = require('../config/database');

class PropriedadeRepository {
  async findAllByProdutor(produtorId) {
    const [rows] = await pool.execute(
      'SELECT * FROM propriedades WHERE produtor_id = ?',
      [produtorId]
    );
    return rows;
  }

  async create(data) {
    const { codigo_ibge, produtor_id, nome, area_total, area_produtiva, latitude, longitude, tipo } = data;
    const [result] = await pool.execute(
      `INSERT INTO propriedades (codigo_ibge, produtor_id, nome, area_total, area_produtiva, latitude, longitude, tipo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_ibge, produtor_id, nome, area_total, area_produtiva, latitude, longitude, tipo]
    );
    return result.insertId;
  }

  async addDocumento(propriedadeId, tipo, arquivo) {
    await pool.execute(
      'INSERT INTO documentos_propriedade (propriedade_id, tipo, arquivo) VALUES (?, ?, ?)',
      [propriedadeId, tipo, arquivo]
    );
  }
}

module.exports = new PropriedadeRepository();
