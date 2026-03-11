const pool = require('../config/database');

class PropriedadeRepository {
  toDecimal(value) {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  toInteger(value) {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  async findAllByProdutor(produtorId, codigoIbge) {
    const query = codigoIbge
      ? 'SELECT * FROM propriedades WHERE produtor_id = ? AND codigo_ibge = ?'
      : 'SELECT * FROM propriedades WHERE produtor_id = ?';
    const params = codigoIbge ? [produtorId, codigoIbge] : [produtorId];
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async findAllByIbge(codigoIbge) {
    const whereClause = codigoIbge ? 'WHERE p.codigo_ibge = ?' : '';
    const params = codigoIbge ? [codigoIbge] : [];
    const [rows] = await pool.execute(
      `SELECT p.*, pr.nome as produtor_nome 
       FROM propriedades p 
       JOIN produtores pr ON p.produtor_id = pr.id 
       ${whereClause}`,
      params
    );
    return rows;
  }

  async findById(id, codigoIbge) {
    const whereClause = codigoIbge ? 'WHERE p.id = ? AND p.codigo_ibge = ?' : 'WHERE p.id = ?';
    const params = codigoIbge ? [id, codigoIbge] : [id];
    const [rows] = await pool.execute(
      `SELECT p.*, pr.nome as produtor_nome
       FROM propriedades p
       JOIN produtores pr ON p.produtor_id = pr.id
       ${whereClause}`,
      params
    );
    return rows[0];
  }

  async create(data) {
    const { codigo_ibge, produtor_id, nome, area_total, area_produtiva, latitude, longitude, tipo } = data;
    const [result] = await pool.execute(
      `INSERT INTO propriedades (codigo_ibge, produtor_id, nome, area_total, area_produtiva, latitude, longitude, tipo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_ibge,
        this.toInteger(produtor_id),
        nome,
        this.toDecimal(area_total),
        this.toDecimal(area_produtiva),
        this.toDecimal(latitude),
        this.toDecimal(longitude),
        this.toInteger(tipo)
      ]
    );
    return result.insertId;
  }

  async update(id, codigoIbge, data) {
    const { produtor_id, nome, area_total, area_produtiva, latitude, longitude, tipo } = data;
    const whereClause = codigoIbge ? 'WHERE id = ? AND codigo_ibge = ?' : 'WHERE id = ?';
    const params = [
      this.toInteger(produtor_id),
      nome,
      this.toDecimal(area_total),
      this.toDecimal(area_produtiva),
      this.toDecimal(latitude),
      this.toDecimal(longitude),
      this.toInteger(tipo),
      id
    ];
    if (codigoIbge) {
      params.push(codigoIbge);
    }
    const [result] = await pool.execute(
      `UPDATE propriedades
       SET produtor_id = ?, nome = ?, area_total = ?, area_produtiva = ?, latitude = ?, longitude = ?, tipo = ?
       ${whereClause}`,
      params
    );
    return result.affectedRows > 0;
  }

  async delete(id, codigoIbge) {
    const query = codigoIbge
      ? 'DELETE FROM propriedades WHERE id = ? AND codigo_ibge = ?'
      : 'DELETE FROM propriedades WHERE id = ?';
    const params = codigoIbge ? [id, codigoIbge] : [id];
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  async findCulturas() {
    const [rows] = await pool.execute(
      `SELECT id, nome_cultura AS nome, categoria AS categoria, tipo_ciclo
       FROM culturas_saf
       WHERE ativo = TRUE
       ORDER BY nome_cultura ASC`
    );
    return rows;
  }

  async findCulturasByPropriedade(propriedadeId, codigoIbge) {
    const whereClause = codigoIbge
      ? 'WHERE pcs.propriedade_id = ? AND p.codigo_ibge = ?'
      : 'WHERE pcs.propriedade_id = ?';
    const params = codigoIbge ? [propriedadeId, codigoIbge] : [propriedadeId];
    const [rows] = await pool.execute(
      `SELECT pcs.id, pcs.propriedade_id, pcs.cultura_id,
              cs.nome_cultura AS cultura_nome, cs.categoria AS cultura_categoria, cs.tipo_ciclo AS cultura_tipo_ciclo,
              pcs.area_ha, pcs.quantidade_plantas, pcs.ano_implantacao, pcs.sistema_saf, pcs.observacoes
       FROM propriedade_cultura_saf pcs
       JOIN culturas_saf cs ON pcs.cultura_id = cs.id
       JOIN propriedades p ON p.id = pcs.propriedade_id
       ${whereClause}
       ORDER BY cs.nome_cultura ASC`,
      params
    );
    return rows;
  }

  async addCulturaNaPropriedade(data) {
    const { propriedade_id, cultura_id, area_ha, quantidade_plantas, ano_implantacao, sistema_saf, observacoes } = data;
    const [result] = await pool.execute(
      `INSERT INTO propriedade_cultura_saf
       (propriedade_id, cultura_id, area_ha, quantidade_plantas, ano_implantacao, sistema_saf, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        this.toInteger(propriedade_id),
        this.toInteger(cultura_id),
        this.toDecimal(area_ha),
        this.toInteger(quantidade_plantas),
        this.toInteger(ano_implantacao),
        sistema_saf || null,
        observacoes || null
      ]
    );
    return result.insertId;
  }

  async updateCulturaDaPropriedade(culturaRegistroId, propriedadeId, codigoIbge, data) {
    const { cultura_id, area_ha, quantidade_plantas, ano_implantacao, sistema_saf, observacoes } = data;
    const whereClause = codigoIbge
      ? 'WHERE pcs.id = ? AND pcs.propriedade_id = ? AND p.codigo_ibge = ?'
      : 'WHERE pcs.id = ? AND pcs.propriedade_id = ?';
    const params = [
      this.toInteger(cultura_id),
      this.toDecimal(area_ha),
      this.toInteger(quantidade_plantas),
      this.toInteger(ano_implantacao),
      sistema_saf || null,
      observacoes || null,
      culturaRegistroId,
      this.toInteger(propriedadeId)
    ];
    if (codigoIbge) {
      params.push(codigoIbge);
    }
    const [result] = await pool.execute(
      `UPDATE propriedade_cultura_saf pcs
       JOIN propriedades p ON p.id = pcs.propriedade_id
       SET pcs.cultura_id = ?, pcs.area_ha = ?, pcs.quantidade_plantas = ?, pcs.ano_implantacao = ?, pcs.sistema_saf = ?, pcs.observacoes = ?
       ${whereClause}`,
      params
    );
    return result.affectedRows > 0;
  }

  async deleteCulturaDaPropriedade(culturaRegistroId, propriedadeId, codigoIbge) {
    const whereClause = codigoIbge
      ? 'WHERE pcs.id = ? AND pcs.propriedade_id = ? AND p.codigo_ibge = ?'
      : 'WHERE pcs.id = ? AND pcs.propriedade_id = ?';
    const params = codigoIbge
      ? [culturaRegistroId, this.toInteger(propriedadeId), codigoIbge]
      : [culturaRegistroId, this.toInteger(propriedadeId)];
    const [result] = await pool.execute(
      `DELETE pcs
       FROM propriedade_cultura_saf pcs
       JOIN propriedades p ON p.id = pcs.propriedade_id
       ${whereClause}`,
      params
    );
    return result.affectedRows > 0;
  }

  async addDocumento(propriedadeId, tipo, arquivo) {
    await pool.execute(
      'INSERT INTO documentos_propriedade (propriedade_id, tipo, arquivo) VALUES (?, ?, ?)',
      [propriedadeId, tipo, arquivo]
    );
  }
}

module.exports = new PropriedadeRepository();
