import { db } from './db';
import { syncEngine } from './syncEngine';

export const fieldService = {
  async salvarProdutorLocal(payload) {
    const localId = syncEngine.makeLocalId('prod');
    await db.createProdutorLocal({
      local_id: localId,
      ...payload
    });
    await db.queueChange({
      op_id: syncEngine.makeOpId(),
      entity: 'produtor',
      action: 'upsert',
      local_id: localId,
      payload: {
        produtor: {
          nome: payload.nome,
          cpf: payload.cpf,
          telefone: payload.telefone,
          email: payload.email
        },
        endereco: {
          logradouro: payload.logradouro,
          numero: payload.numero,
          bairro: payload.bairro,
          cidade: payload.cidade,
          cep: payload.cep
        }
      }
    });
    return localId;
  },

  async salvarAtendimentoLocal(payload) {
    const localId = syncEngine.makeLocalId('at');
    await db.createAtendimentoLocal({
      local_id: localId,
      ...payload
    });
    await db.queueChange({
      op_id: syncEngine.makeOpId(),
      entity: 'atendimento',
      action: 'create',
      local_id: localId,
      payload: {
        produtor_server_id: payload.produtor_server_id,
        data_atendimento: payload.data_atendimento,
        motivo: payload.motivo,
        observacoes: payload.observacoes,
        recomendacoes: payload.recomendacoes,
        latitude: payload.latitude,
        longitude: payload.longitude,
        veiculo_id: payload.veiculo_id,
        km_saida: payload.km_saida,
        km_chegada: payload.km_chegada,
        km_percorrido: payload.km_percorrido
      }
    });
    return localId;
  },

  async salvarFotoAtendimentoLocal(payload) {
    const localId = syncEngine.makeLocalId('foto');
    await db.createFotoLocal({
      local_id: localId,
      atendimento_server_id: payload.atendimento_server_id,
      atendimento_local_id: payload.atendimento_local_id,
      arquivo_uri: payload.arquivo_uri
    });
    await db.queueChange({
      op_id: syncEngine.makeOpId(),
      entity: 'foto_atendimento',
      action: 'create',
      local_id: localId,
      payload: {
        atendimento_server_id: payload.atendimento_server_id,
        atendimento_local_id: payload.atendimento_local_id,
        arquivo_uri: payload.arquivo_uri
      }
    });
    return localId;
  },

  async listarProdutoresLocais() {
    return db.listProdutoresLocal();
  },

  async listarVeiculos() {
    return db.listarVeiculosLocais();
  },

  async listarAtendimentosDoProdutor(produtorServerId) {
    return db.listAtendimentosByProdutorServerId(Number(produtorServerId));
  },

  async listarFotosDoAtendimento(atendimentoLocalId, atendimentoServerId) {
    return db.listFotosByAtendimento(atendimentoLocalId, atendimentoServerId);
  },

  async listarConflitosSync() {
    return db.listSyncIssues();
  }
};
