const pool = require('../config/database');

class TecnicoRepository {
  async findAllByIbge(codigoIbge) {
    // Busca usuários com perfil 'TECNICO' ou 'ADMIN' que podem realizar atendimentos
    const [rows] = await pool.execute(
      `SELECT id, nome, email, telefone, crea 
       FROM usuarios 
       WHERE codigo_ibge = ? AND (perfil = 'TECNICO' OR perfil = 'ADMIN') AND ativo = TRUE`,
      [codigoIbge]
    );
    return rows;
  }
}

module.exports = new TecnicoRepository();
