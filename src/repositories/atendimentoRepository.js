const pool = require('../config/database');

class AtendimentoRepository {
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
      `SELECT a.*, u.nome as tecnico_nome, COALESCE(t.descricao, a.descricao) as motivo
       FROM atendimentos a
       LEFT JOIN usuarios u ON a.tecnico_id = u.id
       LEFT JOIN tipos_atendimento t ON a.tipo_atendimento_id = t.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  async create(data) {
    const { codigo_ibge, tecnico_id, produtor_id, data_visita, data_atendimento, motivo, observacoes, recomendacoes, latitude, longitude } = data;
    const dataAtendimento = data_visita || data_atendimento || null;
    const descricao = [motivo, observacoes, recomendacoes].filter(Boolean).join(' | ') || null;

    const [result] = await pool.execute(
      `INSERT INTO atendimentos (codigo_ibge, tecnico_id, produtor_id, tipo_atendimento_id, data_atendimento, descricao, latitude, longitude) 
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`,
      [codigo_ibge, tecnico_id, produtor_id, dataAtendimento, descricao, latitude || null, longitude || null]
    );
    return result.insertId;
  }

  async addFoto(atendimentoId, caminhoArquivo, descricao) {
    await pool.execute(
      'INSERT INTO fotos_atendimento (atendimento_id, caminho_arquivo, descricao) VALUES (?, ?, ?)',
      [atendimentoId, caminhoArquivo, descricao]
    );
  }

  async getFotos(atendimentoId) {
    const [rows] = await pool.execute(
      'SELECT * FROM fotos_atendimento WHERE atendimento_id = ?',
      [atendimentoId]
    );
    return rows;
  }
}

module.exports = new AtendimentoRepository();
