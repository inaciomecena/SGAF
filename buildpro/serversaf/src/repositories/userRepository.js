const pool = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE LOWER(email) = LOWER(?) AND ativo = TRUE',
      [email]
    );
    return rows[0];
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, codigo_ibge, nome, email, perfil, telefone, ativo FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async findByIdWithPassword(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async findByEmailAnyStatus(email) {
    const [rows] = await pool.execute(
      'SELECT id, email, ativo FROM usuarios WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    return rows[0];
  }

  async create(userData) {
    const { codigo_ibge, nome, email, senha_hash, perfil, telefone } = userData;
    const [result] = await pool.execute(
      `INSERT INTO usuarios (codigo_ibge, nome, email, senha_hash, perfil, telefone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo_ibge, nome, email, senha_hash, perfil, telefone]
    );
    return result.insertId;
  }

  async updateLastLogin(id) {
    await pool.execute(
      'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
      [id]
    );
  }

  async updatePassword(id, senhaHash) {
    await pool.execute(
      'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
      [senhaHash, id]
    );
  }

  async update(id, userData) {
    const { codigo_ibge, nome, email, perfil, telefone, senha_hash } = userData;
    await pool.execute(
      `UPDATE usuarios
       SET codigo_ibge = ?, nome = ?, email = ?, perfil = ?, telefone = ?, senha_hash = COALESCE(?, senha_hash)
       WHERE id = ? AND ativo = TRUE`,
      [codigo_ibge, nome, email, perfil, telefone || null, senha_hash || null, id]
    );
  }

  async deactivate(id) {
    await pool.execute(
      'UPDATE usuarios SET ativo = FALSE WHERE id = ?',
      [id]
    );
  }

  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT id, codigo_ibge, nome, email, perfil, telefone, ativo, ultimo_login FROM usuarios WHERE codigo_ibge = ? AND ativo = TRUE',
      [codigoIbge]
    );
    return rows;
  }

  async findAllActive() {
    const [rows] = await pool.execute(
      'SELECT id, codigo_ibge, nome, email, perfil, telefone, ativo, ultimo_login FROM usuarios WHERE ativo = TRUE'
    );
    return rows;
  }
}

module.exports = new UserRepository();
