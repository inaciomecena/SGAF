const pool = require('../config/database');

class TecnicoRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, telefone, perfil
       FROM usuarios 
       WHERE codigo_ibge = ?
         AND ativo = TRUE
         AND UPPER(TRIM(perfil)) IN ('TECNICO', 'TECNICO_CAMPO')`,
      [codigoIbge]
    );
    return rows;
  }

  async findByIdAndIbge(id, codigoIbge) {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, telefone, perfil
       FROM usuarios
       WHERE id = ? AND codigo_ibge = ? AND ativo = TRUE`,
      [id, codigoIbge]
    );
    return rows[0];
  }
}

module.exports = new TecnicoRepository();
