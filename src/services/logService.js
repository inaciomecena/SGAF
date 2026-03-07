const logRepository = require('../repositories/logRepository');

class LogService {
  sanitizarLimite(limit) {
    const parsed = Number(limit) || 100;
    return Math.min(Math.max(parsed, 1), 500);
  }

  async registrarAcesso({ usuario_id, ip, user_agent }) {
    if (!usuario_id) {
      return;
    }
    try {
      await logRepository.createAccessLog({ usuario_id, ip, user_agent });
    } catch (error) {
      console.error(error);
    }
  }

  async registrarSistema({ usuario_id, acao, tabela, registro_id }) {
    if (!usuario_id || !acao || !tabela) {
      return;
    }
    try {
      await logRepository.createSystemLog({
        usuario_id,
        acao,
        tabela,
        registro_id: registro_id ?? null
      });
    } catch (error) {
      console.error(error);
    }
  }

  async listarLogsAcesso({ codigoIbge, limit }) {
    const limite = this.sanitizarLimite(limit);
    return await logRepository.findAccessLogs({ codigoIbge, limit: limite });
  }

  async listarLogsSistema({ codigoIbge, limit }) {
    const limite = this.sanitizarLimite(limit);
    return await logRepository.findSystemLogs({ codigoIbge, limit: limite });
  }
}

module.exports = new LogService();
