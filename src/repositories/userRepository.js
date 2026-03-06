const pool = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
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

  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT id, codigo_ibge, nome, email, perfil, telefone, ativo, ultimo_login FROM usuarios WHERE codigo_ibge = ? AND ativo = TRUE',
      [codigoIbge]
    );
    return rows;
  }
}

module.exports = new UserRepository();
