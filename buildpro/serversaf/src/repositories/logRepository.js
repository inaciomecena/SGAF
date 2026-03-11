const pool = require('../config/database');

class LogRepository {
  async createAccessLog({ usuario_id, ip, user_agent }) {
    await pool.execute(
      'INSERT INTO logs_acesso (usuario_id, ip, data_login, user_agent) VALUES (?, ?, NOW(), ?)',
      [usuario_id, ip, user_agent]
    );
  }

  async createSystemLog({ usuario_id, acao, tabela, registro_id }) {
    await pool.execute(
      'INSERT INTO logs_sistema (usuario_id, acao, tabela, registro_id) VALUES (?, ?, ?, ?)',
      [usuario_id, acao, tabela, registro_id]
    );
  }

  async findAccessLogs({ codigoIbge, limit }) {
    if (codigoIbge) {
      const [rows] = await pool.execute(
        `SELECT la.id, la.usuario_id, la.ip, la.data_login, la.user_agent,
                u.nome AS usuario_nome, u.email AS usuario_email, u.perfil AS usuario_perfil, u.codigo_ibge
         FROM logs_acesso la
         LEFT JOIN usuarios u ON u.id = la.usuario_id
         WHERE u.codigo_ibge = ?
         ORDER BY la.data_login DESC
         LIMIT ?`,
        [codigoIbge, limit]
      );
      return rows;
    }

    const [rows] = await pool.execute(
      `SELECT la.id, la.usuario_id, la.ip, la.data_login, la.user_agent,
              u.nome AS usuario_nome, u.email AS usuario_email, u.perfil AS usuario_perfil, u.codigo_ibge
       FROM logs_acesso la
       LEFT JOIN usuarios u ON u.id = la.usuario_id
       ORDER BY la.data_login DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  async findSystemLogs({ codigoIbge, limit }) {
    if (codigoIbge) {
      const [rows] = await pool.execute(
        `SELECT ls.id, ls.usuario_id, ls.acao, ls.tabela, ls.registro_id, ls.data,
                u.nome AS usuario_nome, u.email AS usuario_email, u.perfil AS usuario_perfil, u.codigo_ibge
         FROM logs_sistema ls
         LEFT JOIN usuarios u ON u.id = ls.usuario_id
         WHERE u.codigo_ibge = ?
         ORDER BY ls.data DESC
         LIMIT ?`,
        [codigoIbge, limit]
      );
      return rows;
    }

    const [rows] = await pool.execute(
      `SELECT ls.id, ls.usuario_id, ls.acao, ls.tabela, ls.registro_id, ls.data,
              u.nome AS usuario_nome, u.email AS usuario_email, u.perfil AS usuario_perfil, u.codigo_ibge
       FROM logs_sistema ls
       LEFT JOIN usuarios u ON u.id = ls.usuario_id
       ORDER BY ls.data DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = new LogRepository();
