const pool = require('../config/database');

class AtendimentoRepository {
  async ensureSchema() {
    const [rows] = await pool.execute(
      `SELECT DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'atendimentos'
         AND COLUMN_NAME = 'data_atendimento'`
    );

    const dataType = rows?.[0]?.DATA_TYPE;
    if (String(dataType).toLowerCase() === 'date') {
      await pool.execute('ALTER TABLE atendimentos MODIFY data_atendimento DATETIME NULL');
    }
  }

  async findByProdutor(produtorId) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.nome as tecnico_nome, NULL as propriedade_nome, COALESCE(t.descricao, a.descricao) as motivo
       FROM atendimentos a
       LEFT JOIN usuarios u ON a.tecnico_id = u.id
       LEFT JOIN tipos_atendimento t ON a.tipo_atendimento_id = t.id
       WHERE a.produtor_id = ?
       ORDER BY a.data_atendimento DESC`,
      [produtorId]
    );
    return rows;
  }

  async findAllByIbge(codigoIbge) {
    const whereClause = codigoIbge ? 'WHERE a.codigo_ibge = ?' : '';
    const params = codigoIbge ? [codigoIbge] : [];

    const [rows] = await pool.execute(
      `SELECT a.*, u.nome as tecnico_nome, p.nome as produtor_nome, NULL as propriedade_nome, COALESCE(t.descricao, a.descricao) as motivo
       FROM atendimentos a
       LEFT JOIN usuarios u ON a.tecnico_id = u.id
       JOIN produtores p ON a.produtor_id = p.id
       LEFT JOIN tipos_atendimento t ON a.tipo_atendimento_id = t.id
       ${whereClause}
       ORDER BY a.data_atendimento DESC`,
      params
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.nome as tecnico_nome, p.nome as produtor_nome, COALESCE(t.descricao, a.descricao) as motivo
       FROM atendimentos a
       LEFT JOIN usuarios u ON a.tecnico_id = u.id
       LEFT JOIN produtores p ON a.produtor_id = p.id
       LEFT JOIN tipos_atendimento t ON a.tipo_atendimento_id = t.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  async create(data) {
    const { codigo_ibge, tecnico_id, produtor_id, data_visita, hora_visita, data_atendimento, motivo, observacoes, recomendacoes, latitude, longitude } = data;
    const dataAtendimento = data_atendimento || (data_visita && hora_visita ? `${data_visita} ${hora_visita}:00` : data_visita) || null;
    const descricao = [motivo, observacoes, recomendacoes].filter(Boolean).join(' | ') || null;

    const [result] = await pool.execute(
      `INSERT INTO atendimentos (codigo_ibge, tecnico_id, produtor_id, tipo_atendimento_id, data_atendimento, descricao, latitude, longitude) 
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`,
      [codigo_ibge, tecnico_id, produtor_id, dataAtendimento, descricao, latitude || null, longitude || null]
    );
    return result.insertId;
  }

  async addFoto(atendimentoId, arquivo) {
    await pool.execute(
      'INSERT INTO fotos_atendimento (atendimento_id, arquivo) VALUES (?, ?)',
      [atendimentoId, arquivo]
    );
  }

  async getFotos(atendimentoId) {
    const [rows] = await pool.execute(
      'SELECT id, atendimento_id, arquivo FROM fotos_atendimento WHERE atendimento_id = ? ORDER BY id DESC',
      [atendimentoId]
    );
    return rows;
  }

  async getFotoById(fotoId) {
    const [rows] = await pool.execute(
      'SELECT * FROM fotos_atendimento WHERE id = ?',
      [fotoId]
    );
    return rows[0];
  }

  async removeFoto(fotoId) {
    await pool.execute(
      'DELETE FROM fotos_atendimento WHERE id = ?',
      [fotoId]
    );
  }
}

module.exports = new AtendimentoRepository();
