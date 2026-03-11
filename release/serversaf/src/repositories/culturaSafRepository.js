const pool = require('../config/database');

class CulturaSafRepository {
  async ensureSchema() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS culturas_saf (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_cultura VARCHAR(120) NOT NULL,
        nome_cientifico VARCHAR(150),
        categoria VARCHAR(50),
        tipo_ciclo VARCHAR(30),
        finalidade VARCHAR(100),
        tempo_producao_anos INT,
        origem VARCHAR(50),
        observacoes TEXT,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categorias_cultura (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(50) NOT NULL UNIQUE,
        descricao TEXT
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS propriedade_cultura_saf (
        id INT AUTO_INCREMENT PRIMARY KEY,
        propriedade_id INT NOT NULL,
        cultura_id INT NOT NULL,
        area_ha DECIMAL(10,2),
        quantidade_plantas INT,
        ano_implantacao YEAR,
        sistema_saf VARCHAR(50),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_propriedade_cultura_saf_cultura
          FOREIGN KEY (cultura_id) REFERENCES culturas_saf(id)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS talhoes_saf (
        id INT AUTO_INCREMENT PRIMARY KEY,
        propriedade_id INT,
        nome_talhao VARCHAR(100),
        area_ha DECIMAL(10,2),
        geometria GEOMETRY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async seedCategorias(categorias) {
    if (!categorias.length) return;
    const placeholders = categorias.map(() => '(?, ?)').join(', ');
    const params = categorias.flatMap((item) => [item.nome, item.descricao]);
    await pool.execute(
      `INSERT IGNORE INTO categorias_cultura (nome, descricao) VALUES ${placeholders}`,
      params
    );
  }

  async countAll() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM culturas_saf');
    return rows[0]?.total || 0;
  }

  async bulkInsert(culturas) {
    if (!culturas.length) return;
    const placeholders = culturas.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const params = culturas.flatMap((item) => ([
      item.nome_cultura,
      item.nome_cientifico,
      item.categoria,
      item.tipo_ciclo,
      item.finalidade,
      item.tempo_producao_anos
    ]));
    await pool.execute(
      `INSERT INTO culturas_saf
      (nome_cultura, nome_cientifico, categoria, tipo_ciclo, finalidade, tempo_producao_anos)
      VALUES ${placeholders}`,
      params
    );
  }

  async findAll({ search, categoria, tipo_ciclo }) {
    const conditions = ['ativo = TRUE'];
    const params = [];

    if (search) {
      conditions.push('(nome_cultura LIKE ? OR nome_cientifico LIKE ? OR finalidade LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (categoria) {
      conditions.push('categoria = ?');
      params.push(categoria);
    }
    if (tipo_ciclo) {
      conditions.push('tipo_ciclo = ?');
      params.push(tipo_ciclo);
    }

    const [rows] = await pool.execute(
      `SELECT id, nome_cultura, nome_cientifico, categoria, tipo_ciclo, finalidade, tempo_producao_anos, origem, observacoes, ativo
       FROM culturas_saf
       WHERE ${conditions.join(' AND ')}
       ORDER BY nome_cultura ASC`,
      params
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, nome_cultura, nome_cientifico, categoria, tipo_ciclo, finalidade, tempo_producao_anos, origem, observacoes, ativo
       FROM culturas_saf
       WHERE id = ? AND ativo = TRUE
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { nome_cultura, nome_cientifico, categoria, tipo_ciclo, finalidade, tempo_producao_anos, origem, observacoes } = data;
    const [result] = await pool.execute(
      `INSERT INTO culturas_saf
      (nome_cultura, nome_cientifico, categoria, tipo_ciclo, finalidade, tempo_producao_anos, origem, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_cultura,
        nome_cientifico || null,
        categoria || null,
        tipo_ciclo || null,
        finalidade || null,
        tempo_producao_anos || null,
        origem || null,
        observacoes || null
      ]
    );
    return result.insertId;
  }

  async update(id, data) {
    const { nome_cultura, nome_cientifico, categoria, tipo_ciclo, finalidade, tempo_producao_anos, origem, observacoes } = data;
    const [result] = await pool.execute(
      `UPDATE culturas_saf
       SET nome_cultura = ?, nome_cientifico = ?, categoria = ?, tipo_ciclo = ?, finalidade = ?, tempo_producao_anos = ?, origem = ?, observacoes = ?
       WHERE id = ? AND ativo = TRUE`,
      [
        nome_cultura,
        nome_cientifico || null,
        categoria || null,
        tipo_ciclo || null,
        finalidade || null,
        tempo_producao_anos || null,
        origem || null,
        observacoes || null,
        id
      ]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CulturaSafRepository();
