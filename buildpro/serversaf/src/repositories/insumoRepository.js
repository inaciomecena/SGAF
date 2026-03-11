const pool = require('../config/database');

class InsumoRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT * FROM insumos WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return rows;
  }

  async create(data) {
    const { codigo_ibge, nome, tipo, unidade } = data;
    const [result] = await pool.execute(
      'INSERT INTO insumos (codigo_ibge, nome, tipo, unidade) VALUES (?, ?, ?, ?)',
      [codigo_ibge, nome, tipo, unidade]
    );
    return result.insertId;
  }

  async adicionarEstoque(data) {
    const { insumo_id, quantidade, data_entrada } = data;
    await pool.execute(
      'INSERT INTO estoque_insumos (insumo_id, quantidade, data_entrada) VALUES (?, ?, ?)',
      [insumo_id, quantidade, data_entrada]
    );
  }

  async registrarDistribuicao(data) {
    const { insumo_id, produtor_id, quantidade, data_entrega } = data;
    await pool.execute(
      'INSERT INTO distribuicao_insumos (insumo_id, produtor_id, quantidade, data_entrega) VALUES (?, ?, ?, ?)',
      [insumo_id, produtor_id, quantidade, data_entrega]
    );
  }
  
  async getEstoqueTotal(insumoId) {
     // Calcula entrada - saída
     const [entradas] = await pool.execute(
         'SELECT SUM(quantidade) as total FROM estoque_insumos WHERE insumo_id = ?',
         [insumoId]
     );
     const [saidas] = await pool.execute(
         'SELECT SUM(quantidade) as total FROM distribuicao_insumos WHERE insumo_id = ?',
         [insumoId]
     );
     
     const totalEntrada = entradas[0].total || 0;
     const totalSaida = saidas[0].total || 0;
     
     return totalEntrada - totalSaida;
  }
}

module.exports = new InsumoRepository();
