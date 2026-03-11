const pool = require('../config/database');

class SyncRepository {
  async ensureSchema() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sync_events (
        id BIGINT NOT NULL AUTO_INCREMENT,
        codigo_ibge VARCHAR(10) NOT NULL,
        entity VARCHAR(40) NOT NULL,
        record_id BIGINT NULL,
        action VARCHAR(20) NOT NULL,
        payload_json LONGTEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_sync_events_ibge_id (codigo_ibge, id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sync_operations (
        id BIGINT NOT NULL AUTO_INCREMENT,
        codigo_ibge VARCHAR(10) NOT NULL,
        op_id VARCHAR(100) NOT NULL,
        result_json LONGTEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_sync_operations_ibge_op (codigo_ibge, op_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async findOperation(codigoIbge, opId) {
    const [rows] = await pool.execute(
      'SELECT result_json FROM sync_operations WHERE codigo_ibge = ? AND op_id = ? LIMIT 1',
      [codigoIbge, opId]
    );
    return rows[0] || null;
  }

  async saveOperation(connection, codigoIbge, opId, result) {
    await connection.execute(
      'INSERT INTO sync_operations (codigo_ibge, op_id, result_json) VALUES (?, ?, ?)',
      [codigoIbge, opId, JSON.stringify(result)]
    );
  }

  async appendEvent(connection, { codigoIbge, entity, recordId, action, payload }) {
    const [result] = await connection.execute(
      'INSERT INTO sync_events (codigo_ibge, entity, record_id, action, payload_json) VALUES (?, ?, ?, ?, ?)',
      [codigoIbge, entity, recordId || null, action, JSON.stringify(payload)]
    );
    return result.insertId;
  }

  async listEvents(codigoIbge, cursor, limit) {
    const [rows] = await pool.execute(
      `SELECT id, entity, record_id, action, payload_json, created_at
       FROM sync_events
       WHERE codigo_ibge = ? AND id > ?
       ORDER BY id ASC
       LIMIT ?`,
      [codigoIbge, cursor, limit]
    );
    return rows;
  }

  async getLatestCursor(codigoIbge) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(MAX(id), 0) AS cursor FROM sync_events WHERE codigo_ibge = ?',
      [codigoIbge]
    );
    return Number(rows[0]?.cursor || 0);
  }
}

module.exports = new SyncRepository();
