const pool = require('../config/database');

class ProdutorRepository {
  async findAllByIbge(codigoIbge) {
    const [rows] = await pool.execute(
      `SELECT p.*, a.nome as associacao_nome 
       FROM produtores p 
       LEFT JOIN associacoes a ON p.associacao_id = a.id
       WHERE p.codigo_ibge = ?`,
      [codigoIbge]
    );
    return rows;
  }

  async findById(id, codigoIbge) {
    const [rows] = await pool.execute(
      `SELECT p.*, e.logradouro, e.numero, e.bairro, e.cidade, e.cep 
       FROM produtores p 
       LEFT JOIN enderecos_produtor e ON p.id = e.produtor_id
       WHERE p.id = ? AND p.codigo_ibge = ?`,
      [id, codigoIbge]
    );
    return rows[0];
  }

  async create(produtorData, enderecoData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { codigo_ibge, nome, cpf, data_nascimento, telefone, email, sexo, caf_dap, associacao_id } = produtorData;
      
      const [result] = await connection.execute(
        `INSERT INTO produtores (codigo_ibge, nome, cpf, data_nascimento, telefone, email, sexo, caf_dap, associacao_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [codigo_ibge, nome, cpf, data_nascimento, telefone, email, sexo, caf_dap, associacao_id]
      );
      
      const produtorId = result.insertId;

      if (enderecoData) {
        const { logradouro, numero, bairro, cidade, cep } = enderecoData;
        await connection.execute(
          `INSERT INTO enderecos_produtor (produtor_id, logradouro, numero, bairro, cidade, cep) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [produtorId, logradouro, numero, bairro, cidade, cep]
        );
      }

      await connection.commit();
      return produtorId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id, codigoIbge, produtorData, enderecoData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { nome, cpf, data_nascimento, telefone, email, sexo, caf_dap, associacao_id } = produtorData;
      const [result] = await connection.execute(
        `UPDATE produtores
         SET nome = ?, cpf = ?, data_nascimento = ?, telefone = ?, email = ?, sexo = ?, caf_dap = ?, associacao_id = ?
         WHERE id = ? AND codigo_ibge = ?`,
        [nome, cpf, data_nascimento || null, telefone || null, email || null, sexo || null, caf_dap || null, associacao_id || null, id, codigoIbge]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      if (enderecoData) {
        const { logradouro, numero, bairro, cidade, cep } = enderecoData;
        const [enderecoResult] = await connection.execute(
          `UPDATE enderecos_produtor
           SET logradouro = ?, numero = ?, bairro = ?, cidade = ?, cep = ?
           WHERE produtor_id = ?`,
          [logradouro || null, numero || null, bairro || null, cidade || null, cep || null, id]
        );

        if (enderecoResult.affectedRows === 0) {
          await connection.execute(
            `INSERT INTO enderecos_produtor (produtor_id, logradouro, numero, bairro, cidade, cep)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, logradouro || null, numero || null, bairro || null, cidade || null, cep || null]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ProdutorRepository();
