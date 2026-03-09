import * as SQLite from 'expo-sqlite';

const databasePromise = SQLite.openDatabaseAsync('sgaf_mobile.db');

const asArray = (rowsResult) => {
  if (Array.isArray(rowsResult)) {
    return rowsResult;
  }
  if (rowsResult?.rows?._array) {
    return rowsResult.rows._array;
  }
  return [];
};

export const db = {
  async init() {
    const database = await databasePromise;
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS veiculos_local (
        id INTEGER PRIMARY KEY,
        modelo TEXT NOT NULL,
        placa TEXT NOT NULL,
        marca TEXT,
        ano INTEGER,
        tipo TEXT,
        odometro_atual REAL,
        status TEXT
      );
      CREATE TABLE IF NOT EXISTS produtores_local (
        local_id TEXT PRIMARY KEY,
        server_id INTEGER,
        nome TEXT NOT NULL,
        cpf TEXT,
        telefone TEXT,
        email TEXT,
        logradouro TEXT,
        numero TEXT,
        bairro TEXT,
        cidade TEXT,
        cep TEXT,
        updated_at_local TEXT NOT NULL,
        sync_status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS atendimentos_local (
        local_id TEXT PRIMARY KEY,
        server_id INTEGER,
        produtor_local_id TEXT,
        produtor_server_id INTEGER,
        data_atendimento TEXT,
        motivo TEXT,
        observacoes TEXT,
        recomendacoes TEXT,
        latitude REAL,
        longitude REAL,
        updated_at_local TEXT NOT NULL,
        sync_status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS fotos_atendimento_local (
        local_id TEXT PRIMARY KEY,
        atendimento_local_id TEXT,
        atendimento_server_id INTEGER,
        arquivo_uri TEXT,
        arquivo_remoto TEXT,
        sync_status TEXT NOT NULL,
        updated_at_local TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sync_queue (
        op_id TEXT PRIMARY KEY,
        entity TEXT NOT NULL,
        action TEXT NOT NULL,
        local_id TEXT,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    try {
      await database.execAsync('ALTER TABLE sync_queue ADD COLUMN last_error TEXT');
    } catch (_error) {
    }
    try {
      await database.execAsync('ALTER TABLE atendimentos_local ADD COLUMN veiculo_id INTEGER');
      await database.execAsync('ALTER TABLE atendimentos_local ADD COLUMN km_saida REAL');
      await database.execAsync('ALTER TABLE atendimentos_local ADD COLUMN km_chegada REAL');
      await database.execAsync('ALTER TABLE atendimentos_local ADD COLUMN km_percorrido REAL');
    } catch (_error) {
    }
  },

  async upsertVeiculoLocal(veiculo) {
    const database = await databasePromise;
    await database.runAsync(
      `INSERT OR REPLACE INTO veiculos_local (id, modelo, placa, marca, ano, tipo, odometro_atual, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [veiculo.id, veiculo.modelo, veiculo.placa, veiculo.marca, veiculo.ano, veiculo.tipo, veiculo.odometro_atual, veiculo.status]
    );
  },

  async listarVeiculosLocais() {
    const database = await databasePromise;
    const result = await database.getAllAsync('SELECT * FROM veiculos_local ORDER BY modelo, placa');
    return asArray(result);
  },

  async queueChange(change) {
    const database = await databasePromise;
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT OR REPLACE INTO sync_queue
       (op_id, entity, action, local_id, payload_json, status, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT retry_count FROM sync_queue WHERE op_id = ?), 0), COALESCE((SELECT created_at FROM sync_queue WHERE op_id = ?), ?), ?)`,
      [
        change.op_id,
        change.entity,
        change.action || 'upsert',
        change.local_id || null,
        JSON.stringify(change.payload || {}),
        'pending',
        change.op_id,
        change.op_id,
        now,
        now
      ]
    );
  },

  async pendingQueue(limit = 100) {
    const database = await databasePromise;
    const rows = await database.getAllAsync(
      `SELECT op_id, entity, action, local_id, payload_json
       FROM sync_queue
       WHERE status = 'pending'
       ORDER BY created_at ASC
       LIMIT ?`,
      [limit]
    );
    return asArray(rows).map((row) => ({
      op_id: row.op_id,
      entity: row.entity,
      action: row.action,
      local_id: row.local_id,
      data: JSON.parse(row.payload_json || '{}')
    }));
  },

  async markQueueDone(opId) {
    const database = await databasePromise;
    await database.runAsync(
      `UPDATE sync_queue SET status = 'done', updated_at = ? WHERE op_id = ?`,
      [new Date().toISOString(), opId]
    );
  },

  async markQueueFailed(opId, errorMessage) {
    const database = await databasePromise;
    await database.runAsync(
      `UPDATE sync_queue
       SET retry_count = retry_count + 1, last_error = ?, updated_at = ?
       WHERE op_id = ?`,
      [errorMessage || null, new Date().toISOString(), opId]
    );
  },

  async upsertProdutorLocal(produtor) {
    const database = await databasePromise;
    const localId = produtor.local_id || `srv-prod-${produtor.id}`;
    await database.runAsync(
      `INSERT OR REPLACE INTO produtores_local
       (local_id, server_id, nome, cpf, telefone, email, logradouro, numero, bairro, cidade, cep, updated_at_local, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        localId,
        produtor.id || produtor.server_id || null,
        produtor.nome || '',
        produtor.cpf || null,
        produtor.telefone || null,
        produtor.email || null,
        produtor.logradouro || null,
        produtor.numero || null,
        produtor.bairro || null,
        produtor.cidade || null,
        produtor.cep || null,
        new Date().toISOString(),
        'synced'
      ]
    );
    return localId;
  },

  async setProdutorServerId(localId, serverId) {
    const database = await databasePromise;
    await database.runAsync(
      `UPDATE produtores_local
       SET server_id = ?, sync_status = 'synced', updated_at_local = ?
       WHERE local_id = ?`,
      [serverId, new Date().toISOString(), localId]
    );
  },

  async upsertAtendimentoLocal(atendimento) {
    const database = await databasePromise;
    const localId = atendimento.local_id || `srv-at-${atendimento.id}`;
    await database.runAsync(
      `INSERT OR REPLACE INTO atendimentos_local
       (local_id, server_id, produtor_local_id, produtor_server_id, data_atendimento, motivo, observacoes, recomendacoes, latitude, longitude, veiculo_id, km_saida, km_chegada, km_percorrido, updated_at_local, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        localId,
        atendimento.id || atendimento.server_id || null,
        atendimento.produtor_local_id || null,
        atendimento.produtor_id || atendimento.produtor_server_id || null,
        atendimento.data_atendimento || null,
        atendimento.motivo || null,
        atendimento.observacoes || null,
        atendimento.recomendacoes || null,
        atendimento.latitude || null,
        atendimento.longitude || null,
        atendimento.veiculo_id || null,
        atendimento.km_saida || null,
        atendimento.km_chegada || null,
        atendimento.km_percorrido || null,
        new Date().toISOString(),
        'synced'
      ]
    );
    return localId;
  },

  async setAtendimentoServerId(localId, serverId) {
    const database = await databasePromise;
    await database.runAsync(
      `UPDATE atendimentos_local
       SET server_id = ?, sync_status = 'synced', updated_at_local = ?
       WHERE local_id = ?`,
      [serverId, new Date().toISOString(), localId]
    );
  },

  async getAtendimentoServerId(localId) {
    const database = await databasePromise;
    const row = await database.getFirstAsync(
      `SELECT server_id FROM atendimentos_local WHERE local_id = ? LIMIT 1`,
      [localId]
    );
    return row?.server_id ? Number(row.server_id) : null;
  },

  async upsertFotoLocal(foto) {
    const database = await databasePromise;
    const localId = foto.local_id || `srv-foto-${foto.id || Date.now()}`;
    await database.runAsync(
      `INSERT OR REPLACE INTO fotos_atendimento_local
       (local_id, atendimento_local_id, atendimento_server_id, arquivo_uri, arquivo_remoto, sync_status, updated_at_local)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        localId,
        foto.atendimento_local_id || null,
        foto.atendimento_id || foto.atendimento_server_id || null,
        foto.arquivo_uri || null,
        foto.arquivo || foto.arquivo_remoto || null,
        'synced',
        new Date().toISOString()
      ]
    );
  },

  async createProdutorLocal(produtor) {
    const database = await databasePromise;
    await database.runAsync(
      `INSERT OR REPLACE INTO produtores_local
       (local_id, server_id, nome, cpf, telefone, email, logradouro, numero, bairro, cidade, cep, updated_at_local, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        produtor.local_id,
        null,
        produtor.nome || '',
        produtor.cpf || null,
        produtor.telefone || null,
        produtor.email || null,
        produtor.logradouro || null,
        produtor.numero || null,
        produtor.bairro || null,
        produtor.cidade || null,
        produtor.cep || null,
        new Date().toISOString(),
        'pending'
      ]
    );
  },

  async createAtendimentoLocal(atendimento) {
    const database = await databasePromise;
    await database.runAsync(
      `INSERT OR REPLACE INTO atendimentos_local
       (local_id, server_id, produtor_local_id, produtor_server_id, data_atendimento, motivo, observacoes, recomendacoes, latitude, longitude, veiculo_id, km_saida, km_chegada, km_percorrido, updated_at_local, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        atendimento.local_id,
        null,
        atendimento.produtor_local_id || null,
        atendimento.produtor_server_id || null,
        atendimento.data_atendimento || null,
        atendimento.motivo || null,
        atendimento.observacoes || null,
        atendimento.recomendacoes || null,
        atendimento.latitude || null,
        atendimento.longitude || null,
        atendimento.veiculo_id || null,
        atendimento.km_saida || null,
        atendimento.km_chegada || null,
        atendimento.km_percorrido || null,
        new Date().toISOString(),
        'pending'
      ]
    );
  },

  async createFotoLocal(foto) {
    const database = await databasePromise;
    await database.runAsync(
      `INSERT OR REPLACE INTO fotos_atendimento_local
       (local_id, atendimento_local_id, atendimento_server_id, arquivo_uri, arquivo_remoto, sync_status, updated_at_local)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        foto.local_id,
        foto.atendimento_local_id || null,
        foto.atendimento_server_id || null,
        foto.arquivo_uri || null,
        null,
        'pending',
        new Date().toISOString()
      ]
    );
  },

  async listProdutoresLocal() {
    const database = await databasePromise;
    const rows = await database.getAllAsync(
      `SELECT * FROM produtores_local ORDER BY nome ASC`
    );
    return asArray(rows);
  },

  async listAtendimentosByProdutorServerId(produtorServerId) {
    const database = await databasePromise;
    const rows = await database.getAllAsync(
      `SELECT * FROM atendimentos_local
       WHERE produtor_server_id = ?
       ORDER BY updated_at_local DESC`,
      [produtorServerId]
    );
    return asArray(rows);
  },

  async listFotosByAtendimento(atendimentoLocalId, atendimentoServerId) {
    const database = await databasePromise;
    const rows = await database.getAllAsync(
      `SELECT * FROM fotos_atendimento_local
       WHERE (atendimento_local_id = ? AND ? IS NOT NULL)
          OR (atendimento_server_id = ? AND ? IS NOT NULL)
       ORDER BY updated_at_local DESC`,
      [atendimentoLocalId || null, atendimentoLocalId || null, atendimentoServerId || null, atendimentoServerId || null]
    );
    return asArray(rows);
  },

  async listSyncIssues() {
    const database = await databasePromise;
    const rows = await database.getAllAsync(
      `SELECT op_id, entity, action, retry_count, last_error, updated_at
       FROM sync_queue
       WHERE retry_count > 0
       ORDER BY updated_at DESC
       LIMIT 50`
    );
    return asArray(rows);
  }
};
