const pool = require('../config/database');

class MunicipioRepository {
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
}

module.exports = new MunicipioRepository();
