const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/database');
const syncRepository = require('../repositories/syncRepository');
const produtorRepository = require('../repositories/produtorRepository');
const atendimentoRepository = require('../repositories/atendimentoRepository');
const frotaService = require('./frotaService');

class SyncService {
  async ensureReady() {
    await syncRepository.ensureSchema();
  }

  async buildProdutorPayload(id, codigoIbge) {
    const produtor = await produtorRepository.findById(id, codigoIbge);
    if (!produtor) {
      return null;
    }
    return produtor;
  }

  async buildAtendimentoPayload(id) {
    const atendimento = await atendimentoRepository.findById(id);
    if (!atendimento) {
      return null;
    }
    atendimento.fotos = await atendimentoRepository.getFotos(id);
    return atendimento;
  }

  async registrarEventoDominio({ codigoIbge, entity, recordId, action }) {
    await this.ensureReady();
    const connection = await pool.getConnection();
    try {
      let payload = null;
      if (entity === 'produtor') {
        payload = await this.buildProdutorPayload(recordId, codigoIbge);
      }
      if (entity === 'atendimento') {
        payload = await this.buildAtendimentoPayload(recordId);
      }
      if (entity === 'foto_atendimento') {
        payload = { id: recordId };
      }
      if (!payload) {
        return 0;
      }
      const eventId = await syncRepository.appendEvent(connection, {
        codigoIbge,
        entity,
        recordId,
        action,
        payload
      });
      return eventId;
    } finally {
      connection.release();
    }
  }

  normalizeProdutorData(data, codigoIbge) {
    return {
      codigo_ibge: codigoIbge,
      nome: data.nome || '',
      cpf: data.cpf || null,
      data_nascimento: data.data_nascimento || null,
      telefone: data.telefone || null,
      email: data.email || null,
      sexo: data.sexo || null,
      caf_dap: data.caf_dap || null,
      associacao_id: data.associacao_id || null
    };
  }

  normalizeEnderecoData(data) {
    if (!data) {
      return null;
    }
    return {
      logradouro: data.logradouro || null,
      numero: data.numero || null,
      bairro: data.bairro || null,
      cidade: data.cidade || null,
      cep: data.cep || null
    };
  }

  normalizeAtendimentoData(data, codigoIbge, userId) {
    const produtorId = Number(data.produtor_id || data.produtor_server_id);
    return {
      codigo_ibge: codigoIbge,
      tecnico_id: Number(data.tecnico_id) || Number(userId),
      produtor_id: produtorId,
      data_visita: data.data_visita || data.data_atendimento || null,
      motivo: data.motivo || null,
      observacoes: data.observacoes || null,
      recomendacoes: data.recomendacoes || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      veiculo_id: data.veiculo_id || null,
      km_saida: data.km_saida || null,
      km_chegada: data.km_chegada || null,
      km_percorrido: data.km_percorrido || null
    };
  }

  async storeBase64Image(base64Value) {
    if (!base64Value || typeof base64Value !== 'string') {
      return null;
    }
    const uploadDir = path.resolve(__dirname, '../../uploads/atendimentos');
    await fs.mkdir(uploadDir, { recursive: true });
    const match = base64Value.match(/^data:image\/(\w+);base64,(.+)$/);
    const extension = match?.[1] || 'jpg';
    const content = match?.[2] || base64Value;
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, Buffer.from(content, 'base64'));
    return `/uploads/atendimentos/${fileName}`;
  }

  async applyChange(connection, codigoIbge, userId, change) {
    const entity = change.entity;
    const action = change.action || 'upsert';
    const data = change.data || {};

    if (entity === 'produtor') {
      const produtorData = this.normalizeProdutorData(data.produtor || data, codigoIbge);
      const enderecoData = this.normalizeEnderecoData(data.endereco || null);

      if ((action === 'update' || action === 'upsert') && data.server_id) {
        await produtorRepository.update(data.server_id, codigoIbge, produtorData, enderecoData);
        const payload = await this.buildProdutorPayload(data.server_id, codigoIbge);
        const eventId = await syncRepository.appendEvent(connection, {
          codigoIbge,
          entity: 'produtor',
          recordId: data.server_id,
          action: 'update',
          payload
        });
        return { entity: 'produtor', local_id: change.local_id || null, server_id: Number(data.server_id), event_id: eventId };
      }

      const newId = await produtorRepository.create(produtorData, enderecoData);
      const payload = await this.buildProdutorPayload(newId, codigoIbge);
      const eventId = await syncRepository.appendEvent(connection, {
        codigoIbge,
        entity: 'produtor',
        recordId: newId,
        action: 'create',
        payload
      });
      return { entity: 'produtor', local_id: change.local_id || null, server_id: newId, event_id: eventId };
    }

    if (entity === 'atendimento') {
      const atendimentoData = this.normalizeAtendimentoData(data, codigoIbge, userId);
      if (!atendimentoData.produtor_id || !Number.isInteger(atendimentoData.produtor_id)) {
        throw new Error('Atendimento sem produtor válido');
      }
      const newId = await atendimentoRepository.create(atendimentoData);

      // Se houver veículo vinculado, registra o transporte
      if (atendimentoData.veiculo_id) {
        await frotaService.vincularAtendimento(newId, {
          veiculo_id: atendimentoData.veiculo_id,
          km_saida: atendimentoData.km_saida,
          km_chegada: atendimentoData.km_chegada,
          km_percorrido: atendimentoData.km_percorrido
        });
      }

      const payload = await this.buildAtendimentoPayload(newId);
      const eventId = await syncRepository.appendEvent(connection, {
        codigoIbge,
        entity: 'atendimento',
        recordId: newId,
        action: 'create',
        payload
      });
      return { entity: 'atendimento', local_id: change.local_id || null, server_id: newId, event_id: eventId };
    }

    if (entity === 'foto_atendimento') {
      const atendimentoId = Number(data.atendimento_id || data.atendimento_server_id);
      const arquivo = data.arquivo || await this.storeBase64Image(data.base64);
      if (!atendimentoId || !arquivo) {
        throw new Error('Dados de foto inválidos para sincronização');
      }
      await atendimentoRepository.addFoto(atendimentoId, arquivo);
      const atendimento = await this.buildAtendimentoPayload(atendimentoId);
      const eventId = await syncRepository.appendEvent(connection, {
        codigoIbge,
        entity: 'atendimento',
        recordId: atendimentoId,
        action: 'update',
        payload: atendimento
      });
      return { entity: 'foto_atendimento', local_id: change.local_id || null, server_id: atendimentoId, event_id: eventId };
    }

    throw new Error(`Entidade não suportada: ${entity}`);
  }

  async pushChanges(codigoIbge, userId, changes) {
    await this.ensureReady();
    const normalizedChanges = Array.isArray(changes) ? changes : [];
    const applied = [];
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const change of normalizedChanges) {
        if (!change?.op_id) {
          throw new Error('Mudança sem op_id');
        }
        const existing = await syncRepository.findOperation(codigoIbge, change.op_id);
        if (existing) {
          applied.push(JSON.parse(existing.result_json));
          continue;
        }
        const result = await this.applyChange(connection, codigoIbge, userId, change);
        const opResult = { op_id: change.op_id, status: 'applied', ...result };
        await syncRepository.saveOperation(connection, codigoIbge, change.op_id, opResult);
        applied.push(opResult);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const cursor = await syncRepository.getLatestCursor(codigoIbge);
    return { applied, cursor };
  }

  async pullChanges(codigoIbge, cursor, limit) {
    await this.ensureReady();
    const safeCursor = Number(cursor) > 0 ? Number(cursor) : 0;
    const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 500) : 200;
    const rows = await syncRepository.listEvents(codigoIbge, safeCursor, safeLimit);
    const changes = rows.map((row) => ({
      id: row.id,
      entity: row.entity,
      action: row.action,
      record_id: row.record_id,
      payload: JSON.parse(row.payload_json),
      created_at: row.created_at
    }));
    const nextCursor = changes.length ? changes[changes.length - 1].id : safeCursor;
    return { cursor: nextCursor, changes };
  }
}

module.exports = new SyncService();
