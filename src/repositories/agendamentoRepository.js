const pool = require('../config/database');

class AgendamentoRepository {
  async findAllByIbge({ codigoIbge, ano, mes, tecnicoId }) {
    // Join complexo para trazer nomes e permitir filtros por mês/técnico
    const conditions = [];
    const params = [];

    if (codigoIbge) {
      // Considera tanto o município da máquina quanto do produtor (para agendamentos sem máquina)
      conditions.push('(m.codigo_ibge = ? OR (m.codigo_ibge IS NULL AND p.codigo_ibge = ?))');
      params.push(codigoIbge, codigoIbge);
    }

    if (ano && mes) {
      conditions.push('a.data_inicio >= ? AND a.data_inicio < DATE_ADD(?, INTERVAL 1 MONTH)');
      const start = `${ano}-${String(mes).padStart(2, '0')}-01`;
      params.push(start, start);
    }

    if (tecnicoId) {
      conditions.push('a.tecnico_id = ?');
      params.push(tecnicoId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT 
         a.*,
         m.nome as maquina_nome,
         p.nome as produtor_nome,
         o.nome as operador_nome
       FROM agendamentos_maquinas a
       LEFT JOIN maquinas m ON a.maquina_id = m.id
       LEFT JOIN produtores p ON a.produtor_id = p.id
       LEFT JOIN operadores o ON a.operador_id = o.id
       ${whereClause}
       ORDER BY a.data_inicio ASC`,
      params
    );
    return rows;
  }

  async create(data) {
    const {
      maquina_id,
      produtor_id,
      data_inicio,
      data_fim,
      operador_id,
      titulo,
      descricao,
      tecnico_id,
      atendimento_id,
      tipo = 'MAQUINA'
    } = data;

    // Para tipos que não são de máquina, permitimos maquina_id/produtor_id nulos.
    const finalTipo = tipo || 'MAQUINA';
    const finalMaquinaId = finalTipo === 'MAQUINA' ? maquina_id : maquina_id || null;
    const finalProdutorId = produtor_id || null;
    const [result] = await pool.execute(
      `INSERT INTO agendamentos_maquinas 
         (maquina_id, produtor_id, data_inicio, data_fim, operador_id, titulo, descricao, tecnico_id, atendimento_id, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalMaquinaId,
        finalProdutorId,
        data_inicio, 
        data_fim, 
        operador_id || null,
        titulo || null,
        descricao || null,
        tecnico_id || null,
        atendimento_id || null,
        finalTipo
      ]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
         a.*,
         m.nome as maquina_nome,
         p.nome as produtor_nome,
         o.nome as operador_nome
       FROM agendamentos_maquinas a
       LEFT JOIN maquinas m ON a.maquina_id = m.id
       LEFT JOIN produtores p ON a.produtor_id = p.id
       LEFT JOIN operadores o ON a.operador_id = o.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = [];
    const params = [];

    const updatable = [
      'maquina_id',
      'produtor_id',
      'data_inicio',
      'data_fim',
      'operador_id',
      'titulo',
      'descricao',
      'tecnico_id',
      'atendimento_id',
      'tipo'
    ];

    for (const key of updatable) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) {
      return;
    }

    params.push(id);

    await pool.execute(
      `UPDATE agendamentos_maquinas
       SET ${fields.join(', ')}
       WHERE id = ?`,
      params
    );
  }

  async delete(id) {
    await pool.execute(
      'DELETE FROM agendamentos_maquinas WHERE id = ?',
      [id]
    );
  }

  async findByAtendimento(atendimentoId) {
    const [rows] = await pool.execute(
      `SELECT 
         a.*,
         m.nome as maquina_nome,
         p.nome as produtor_nome,
         o.nome as operador_nome
       FROM agendamentos_maquinas a
       LEFT JOIN maquinas m ON a.maquina_id = m.id
       LEFT JOIN produtores p ON a.produtor_id = p.id
       LEFT JOIN operadores o ON a.operador_id = o.id
       WHERE a.atendimento_id = ?
       ORDER BY a.data_inicio ASC`,
      [atendimentoId]
    );
    return rows;
  }

  async registrarHoras(agendamentoId, horas) {
    await pool.execute(
      'INSERT INTO horas_maquina (agendamento_id, horas_trabalhadas) VALUES (?, ?)',
      [agendamentoId, horas]
    );
  }
  
  async getHoras(agendamentoId) {
    const [rows] = await pool.execute(
      'SELECT * FROM horas_maquina WHERE agendamento_id = ?',
      [agendamentoId]
    );
    return rows;
  }
}

module.exports = new AgendamentoRepository();
