const pool = require('../config/database');

class DashboardRepository {
  async getStats(codigoIbge) {
    const [produtores] = await pool.execute(
      'SELECT COUNT(*) as total FROM produtores WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    
    const [propriedades] = await pool.execute(
      'SELECT COUNT(*) as total FROM propriedades WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    
    const [atendimentos] = await pool.execute(
      'SELECT COUNT(*) as total FROM atendimentos WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    
    const [maquinas] = await pool.execute(
      'SELECT COUNT(*) as total FROM maquinas WHERE codigo_ibge = ?',
      [codigoIbge]
    );

    return {
      produtores: produtores[0].total,
      propriedades: propriedades[0].total,
      atendimentos: atendimentos[0].total,
      maquinas: maquinas[0].total
    };
  }

  async getRecentActivities(codigoIbge) {
    const [rows] = await pool.execute(
      `SELECT a.id, a.data_visita, p.nome as produtor_nome, u.nome as tecnico_nome 
       FROM atendimentos a
       JOIN produtores p ON a.produtor_id = p.id
       JOIN usuarios u ON a.tecnico_id = u.id
       WHERE a.codigo_ibge = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [codigoIbge]
    );
    return rows;
  }
}

module.exports = new DashboardRepository();
