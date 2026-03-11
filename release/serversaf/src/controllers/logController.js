const logService = require('../services/logService');
const { normalizeRole } = require('../utils/roles');

class LogController {
  resolverCodigoIbge(req) {
    const perfil = normalizeRole(req.user?.perfil);
    if (perfil === 'ADMIN_ESTADO') {
      return req.query.codigo_ibge || null;
    }
    return req.user?.codigo_ibge || null;
  }

  async listarAcessos(req, res) {
    try {
      const codigoIbge = this.resolverCodigoIbge(req);
      const logs = await logService.listarLogsAcesso({
        codigoIbge,
        limit: req.query.limit
      });
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar logs de acesso' });
    }
  }

  async listarSistema(req, res) {
    try {
      const codigoIbge = this.resolverCodigoIbge(req);
      const logs = await logService.listarLogsSistema({
        codigoIbge,
        limit: req.query.limit
      });
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar logs do sistema' });
    }
  }
}

module.exports = new LogController();
