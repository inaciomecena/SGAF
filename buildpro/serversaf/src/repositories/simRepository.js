const pool = require('../config/database');

class SimRepository {
  async ensureSchema() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sim_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_ibge VARCHAR(10) NOT NULL UNIQUE,
        possui_sim BOOLEAN NOT NULL,
        possui_medico_veterinario BOOLEAN NOT NULL,
        aderiu_susaf BOOLEAN NOT NULL,
        interesse_aderir_susaf BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sim_info_codigo_ibge (codigo_ibge)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sim_feiras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_ibge VARCHAR(10) NOT NULL,
        ano INT NOT NULL,
        qtd_agricultores_comercializam INT NOT NULL,
        valor_comercializado_anual DECIMAL(14,2) NOT NULL,
        qtd_feiras_permanentes INT NOT NULL,
        qtd_feiras_nao_permanentes INT NOT NULL,
        status_coleta INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_sim_feiras_ibge_ano (codigo_ibge, ano),
        INDEX idx_sim_feiras_codigo_ibge (codigo_ibge),
        INDEX idx_sim_feiras_ano (ano)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sim_tipos_feiras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_ibge VARCHAR(10) NOT NULL,
        ano INT NOT NULL,
        tipo_feira TINYINT NOT NULL,
        qtd_comerciantes_produtores_af INT NOT NULL,
        qtd_mulheres_comerciantes_produtoras_af INT NOT NULL,
        qtd_comerciantes_af_revendedores INT NOT NULL,
        qtd_mulheres_comerciantes_revendedoras_af INT NOT NULL,
        qtd_comerciantes_artesanato INT NOT NULL,
        qtd_mulheres_comerciantes_artesanato INT NOT NULL,
        qtd_comerciantes_produtos_industrializados_externos INT NOT NULL,
        valor_comercializado_anual DECIMAL(14,2) NOT NULL,
        valor_total_comercializado_af DECIMAL(14,2) NOT NULL,
        valor_total_comercializado_feira DECIMAL(14,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_sim_tipos_feiras_ibge_ano_tipo (codigo_ibge, ano, tipo_feira),
        INDEX idx_sim_tipos_feiras_codigo_ibge (codigo_ibge),
        INDEX idx_sim_tipos_feiras_ano (ano)
      )
    `);
  }

  async getInfoByCodigoIbge(codigoIbge) {
    const [rows] = await pool.execute('SELECT * FROM sim_info WHERE codigo_ibge = ?', [codigoIbge]);
    return rows[0] || null;
  }

  async upsertInfoByCodigoIbge(codigoIbge, dados) {
    const payload = [
      codigoIbge,
      dados.possui_sim,
      dados.possui_medico_veterinario,
      dados.aderiu_susaf,
      dados.interesse_aderir_susaf
    ];

    await pool.execute(
      `INSERT INTO sim_info (
        codigo_ibge,
        possui_sim,
        possui_medico_veterinario,
        aderiu_susaf,
        interesse_aderir_susaf
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        possui_sim = VALUES(possui_sim),
        possui_medico_veterinario = VALUES(possui_medico_veterinario),
        aderiu_susaf = VALUES(aderiu_susaf),
        interesse_aderir_susaf = VALUES(interesse_aderir_susaf)`,
      payload
    );
  }

  async getFeirasByCodigoIbgeAno(codigoIbge, ano) {
    const [rows] = await pool.execute(
      'SELECT * FROM sim_feiras WHERE codigo_ibge = ? AND ano = ?',
      [codigoIbge, ano]
    );
    return rows[0] || null;
  }

  async upsertFeirasByCodigoIbgeAno(codigoIbge, ano, dados) {
    const payload = [
      codigoIbge,
      ano,
      dados.qtd_agricultores_comercializam,
      dados.valor_comercializado_anual,
      dados.qtd_feiras_permanentes,
      dados.qtd_feiras_nao_permanentes,
      dados.status_coleta ?? 0
    ];

    await pool.execute(
      `INSERT INTO sim_feiras (
        codigo_ibge,
        ano,
        qtd_agricultores_comercializam,
        valor_comercializado_anual,
        qtd_feiras_permanentes,
        qtd_feiras_nao_permanentes,
        status_coleta
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        qtd_agricultores_comercializam = VALUES(qtd_agricultores_comercializam),
        valor_comercializado_anual = VALUES(valor_comercializado_anual),
        qtd_feiras_permanentes = VALUES(qtd_feiras_permanentes),
        qtd_feiras_nao_permanentes = VALUES(qtd_feiras_nao_permanentes),
        status_coleta = VALUES(status_coleta)`,
      payload
    );
  }

  async getTiposFeirasByCodigoIbgeAno(codigoIbge, ano) {
    const [rows] = await pool.execute(
      'SELECT * FROM sim_tipos_feiras WHERE codigo_ibge = ? AND ano = ? ORDER BY tipo_feira ASC',
      [codigoIbge, ano]
    );
    return rows;
  }

  async getTipoFeiraByCodigoIbgeAnoTipo(codigoIbge, ano, tipoFeira) {
    const [rows] = await pool.execute(
      'SELECT * FROM sim_tipos_feiras WHERE codigo_ibge = ? AND ano = ? AND tipo_feira = ?',
      [codigoIbge, ano, tipoFeira]
    );
    return rows[0] || null;
  }

  async upsertTipoFeiraByCodigoIbgeAnoTipo(codigoIbge, ano, tipoFeira, dados) {
    const payload = [
      codigoIbge,
      ano,
      tipoFeira,
      dados.qtd_comerciantes_produtores_af,
      dados.qtd_mulheres_comerciantes_produtoras_af,
      dados.qtd_comerciantes_af_revendedores,
      dados.qtd_mulheres_comerciantes_revendedoras_af,
      dados.qtd_comerciantes_artesanato,
      dados.qtd_mulheres_comerciantes_artesanato,
      dados.qtd_comerciantes_produtos_industrializados_externos,
      dados.valor_comercializado_anual,
      dados.valor_total_comercializado_af,
      dados.valor_total_comercializado_feira
    ];

    await pool.execute(
      `INSERT INTO sim_tipos_feiras (
        codigo_ibge,
        ano,
        tipo_feira,
        qtd_comerciantes_produtores_af,
        qtd_mulheres_comerciantes_produtoras_af,
        qtd_comerciantes_af_revendedores,
        qtd_mulheres_comerciantes_revendedoras_af,
        qtd_comerciantes_artesanato,
        qtd_mulheres_comerciantes_artesanato,
        qtd_comerciantes_produtos_industrializados_externos,
        valor_comercializado_anual,
        valor_total_comercializado_af,
        valor_total_comercializado_feira
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        qtd_comerciantes_produtores_af = VALUES(qtd_comerciantes_produtores_af),
        qtd_mulheres_comerciantes_produtoras_af = VALUES(qtd_mulheres_comerciantes_produtoras_af),
        qtd_comerciantes_af_revendedores = VALUES(qtd_comerciantes_af_revendedores),
        qtd_mulheres_comerciantes_revendedoras_af = VALUES(qtd_mulheres_comerciantes_revendedoras_af),
        qtd_comerciantes_artesanato = VALUES(qtd_comerciantes_artesanato),
        qtd_mulheres_comerciantes_artesanato = VALUES(qtd_mulheres_comerciantes_artesanato),
        qtd_comerciantes_produtos_industrializados_externos = VALUES(qtd_comerciantes_produtos_industrializados_externos),
        valor_comercializado_anual = VALUES(valor_comercializado_anual),
        valor_total_comercializado_af = VALUES(valor_total_comercializado_af),
        valor_total_comercializado_feira = VALUES(valor_total_comercializado_feira)`,
      payload
    );
  }
}

module.exports = new SimRepository();
