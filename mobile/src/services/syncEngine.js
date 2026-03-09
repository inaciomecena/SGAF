import * as FileSystem from 'expo-file-system';
import api from './api';
import { db } from './db';
import { storage } from './storage';

const generateId = () => {
  if (global.crypto?.randomUUID) {
    return global.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
};

const mapAtendimentoForServer = async (item) => {
  const payload = { ...item.data };
  if (item.entity === 'foto_atendimento' && !payload.atendimento_server_id && payload.atendimento_local_id) {
    const mappedServerId = await db.getAtendimentoServerId(payload.atendimento_local_id);
    if (mappedServerId) {
      payload.atendimento_server_id = mappedServerId;
    }
  }
  if (item.entity === 'foto_atendimento' && payload.arquivo_uri) {
    const base64 = await FileSystem.readAsStringAsync(payload.arquivo_uri, {
      encoding: 'base64'
    });
    payload.base64 = `data:image/jpeg;base64,${base64}`;
    delete payload.arquivo_uri;
  }
  return { ...item, data: payload };
};

export const syncEngine = {
  makeLocalId(prefix) {
    return `${prefix}-${generateId()}`;
  },

  makeOpId() {
    return `op-${generateId()}`;
  },

  async runFullSync() {
    const pending = await db.pendingQueue(200);
    let pushed = 0;
    if (pending.length) {
      for (const item of pending) {
        const mappedItem = await mapAtendimentoForServer(item);
        if (mappedItem.entity === 'foto_atendimento' && !mappedItem.data.atendimento_server_id) {
          continue;
        }
        try {
          const pushResponse = await api.post('/sync/push', { changes: [mappedItem] });
          const applied = pushResponse.data?.applied || [];
          for (const result of applied) {
            await db.markQueueDone(result.op_id);
            pushed += 1;
            if (result.entity === 'produtor' && result.local_id && result.server_id) {
              await db.setProdutorServerId(result.local_id, result.server_id);
            }
            if (result.entity === 'atendimento' && result.local_id && result.server_id) {
              await db.setAtendimentoServerId(result.local_id, result.server_id);
            }
          }
        } catch (error) {
          await db.markQueueFailed(mappedItem.op_id, error.response?.data?.message || error.message || 'Erro de sincronização');
        }
      }
    }

    const cursor = await storage.getCursor();
    const pullResponse = await api.get('/sync/pull', {
      params: { cursor, limit: 300 }
    });
    
    // Sync Veículos (Frota)
    try {
      const veiculosResponse = await api.get('/frota/veiculos');
      if (Array.isArray(veiculosResponse.data)) {
        for (const v of veiculosResponse.data) {
          await db.upsertVeiculoLocal(v);
        }
      }
    } catch (e) {
      console.log('Erro sync frota:', e.message);
    }

    const changes = pullResponse.data?.changes || [];
    for (const change of changes) {
      if (change.entity === 'produtor' && change.payload) {
        await db.upsertProdutorLocal(change.payload);
      }
      if (change.entity === 'atendimento' && change.payload) {
        await db.upsertAtendimentoLocal(change.payload);
        if (Array.isArray(change.payload.fotos)) {
          for (const foto of change.payload.fotos) {
            await db.upsertFotoLocal(foto);
          }
        }
      }
    }
    await storage.setCursor(pullResponse.data?.cursor || cursor);
    return { pushed, pulled: changes.length };
  }
};
