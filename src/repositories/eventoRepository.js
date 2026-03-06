const pool = require('../config/database');

class EventoRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM eventos WHERE codigo_ibge = ? ORDER BY data DESC',
      [codigoIbge]
    );
    return rows;
  }

  async create(data) {
    const { codigo_ibge, nome, local, data: dataEvento, instrutor } = data;
    const [result] = await pool.execute(
      'INSERT INTO eventos (codigo_ibge, nome, local, data, instrutor) VALUES (?, ?, ?, ?, ?)',
      [codigo_ibge, nome, local, dataEvento, instrutor]
    );
    return result.insertId;
  }

  async addParticipante(eventoId, produtorId) {
    await pool.execute(
      'INSERT INTO participantes_evento (evento_id, produtor_id) VALUES (?, ?)',
      [eventoId, produtorId]
    );
  }

  async listarParticipantes(eventoId) {
    const [rows] = await pool.execute(
      `SELECT pe.*, p.nome as produtor_nome 
       FROM participantes_evento pe
       JOIN produtores p ON pe.produtor_id = p.id
       WHERE pe.evento_id = ?`,
      [eventoId]
    );
    return rows;
  }
}

module.exports = new EventoRepository();
