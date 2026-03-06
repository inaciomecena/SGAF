const pool = require('../config/database');

class AtendimentoRepository {
  async findByProdutor(produtorId) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.nome as tecnico_nome, p.nome as propriedade_nome 
       FROM atendimentos a
       JOIN usuarios u ON a.tecnico_id = u.id
       LEFT JOIN propriedades p ON a.propriedade_id = p.id
       WHERE a.produtor_id = ?
       ORDER BY a.data_visita DESC`,
      [produtorId]
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.nome as tecnico_nome 
       FROM atendimentos a
       JOIN usuarios u ON a.tecnico_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  async create(data) {
    const { codigo_ibge, tecnico_id, produtor_id, propriedade_id, data_visita, motivo, observacoes, recomendacoes } = data;
    const [result] = await pool.execute(
      `INSERT INTO atendimentos (codigo_ibge, tecnico_id, produtor_id, propriedade_id, data_visita, motivo, observacoes, recomendacoes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_ibge, tecnico_id, produtor_id, propriedade_id, data_visita, motivo, observacoes, recomendacoes]
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
