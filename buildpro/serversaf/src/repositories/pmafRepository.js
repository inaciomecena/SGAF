const pool = require('../config/database');

class PmafRepository {
  async ensureSchema() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pmaf_informacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_ibge VARCHAR(10) NOT NULL UNIQUE,
        possui_politica BOOLEAN NOT NULL,
        tipo_instrumento INT NULL,
        tipo_instrumento_outro VARCHAR(180) NULL,
        numero_publicacao INT NULL,
        data_publicacao DATE NULL,
        documento_path VARCHAR(255) NULL,
        documento_nome_original VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_pmaf_codigo_ibge (codigo_ibge)
      )
    `);
  }

  async findByCodigoIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM pmaf_informacoes WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows[0] || null;
  }

  async upsertByCodigoIbge(codigoIbge, dados) {
    const payload = [
      codigoIbge,
      dados.possui_politica,
      dados.tipo_instrumento,
      dados.tipo_instrumento_outro,
      dados.numero_publicacao,
      dados.data_publicacao,
      dados.documento_path,
      dados.documento_nome_original
    ];

    await pool.execute(
      `INSERT INTO pmaf_informacoes (
        codigo_ibge,
        possui_politica,
        tipo_instrumento,
        tipo_instrumento_outro,
        numero_publicacao,
        data_publicacao,
        documento_path,
        documento_nome_original
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        possui_politica = VALUES(possui_politica),
        tipo_instrumento = VALUES(tipo_instrumento),
        tipo_instrumento_outro = VALUES(tipo_instrumento_outro),
        numero_publicacao = VALUES(numero_publicacao),
        data_publicacao = VALUES(data_publicacao),
        documento_path = VALUES(documento_path),
        documento_nome_original = VALUES(documento_nome_original)`,
      payload
    );
  }

  async deleteByCodigoIbge(codigoIbge) {
    const [result] = await pool.execute(
      'DELETE FROM pmaf_informacoes WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return result.affectedRows > 0;
  }

  async listAll() {
    const [rows] = await pool.execute(`
      SELECT
        m.codigo_ibge,
        m.nome AS municipio_nome,
        p.possui_politica,
        p.tipo_instrumento,
        p.tipo_instrumento_outro,
        p.numero_publicacao,
        p.data_publicacao,
        p.documento_path,
        p.documento_nome_original,
        p.updated_at
      FROM municipios m
      LEFT JOIN pmaf_informacoes p
        ON p.codigo_ibge = m.codigo_ibge
      WHERE m.ativo = TRUE
      ORDER BY m.nome ASC
    `);
    return rows;
  }
}

module.exports = new PmafRepository();

