const pool = require('../config/database');

class DashboardRepository {
  async getStats(codigoIbge) {
    const whereClause = codigoIbge ? ' WHERE codigo_ibge = ?' : '';
    const params = codigoIbge ? [codigoIbge] : [];

    const [produtores] = await pool.execute(
      `SELECT COUNT(*) as total FROM produtores${whereClause}`,
      params
    );
    
    const [propriedades] = await pool.execute(
      `SELECT COUNT(*) as total FROM propriedades${whereClause}`,
      params
    );
    
    const [atendimentos] = await pool.execute(
      `SELECT COUNT(*) as total FROM atendimentos${whereClause}`,
      params
    );
    
    const [maquinas] = await pool.execute(
      `SELECT COUNT(*) as total FROM maquinas${whereClause}`,
      params
    );

    return {
      produtores: produtores[0].total,
      propriedades: propriedades[0].total,
      atendimentos: atendimentos[0].total,
      maquinas: maquinas[0].total
    };
  }

  async getRecentActivities(codigoIbge) {
    const whereClause = codigoIbge ? 'WHERE a.codigo_ibge = ?' : '';
    const params = codigoIbge ? [codigoIbge] : [];

    const [rows] = await pool.execute(
      `SELECT a.id, a.data_atendimento as created_at, p.nome as produtor_nome,
              CASE
                WHEN a.tecnico_id IS NULL THEN 'Sem técnico'
                ELSE CONCAT('Técnico #', a.tecnico_id)
              END as tecnico_nome
       FROM atendimentos a
       JOIN produtores p ON a.produtor_id = p.id
       ${whereClause}
       ORDER BY a.id DESC
       LIMIT 5`,
      params
    );
    return rows;
  }
}

module.exports = new DashboardRepository();
