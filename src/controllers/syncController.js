const syncService = require('../services/syncService');

class SyncController {
  async push(req, res) {
    try {
      if (!req.tenantId) {
        return res.status(403).json({ message: 'Sincronização mobile requer vínculo municipal' });
      }
      const result = await syncService.pushChanges(req.tenantId, req.user?.id, req.body?.changes || []);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message || 'Erro ao processar push de sincronização' });
    }
  }

  async pull(req, res) {
    try {
      if (!req.tenantId) {
        return res.status(403).json({ message: 'Sincronização mobile requer vínculo municipal' });
      }
      const { cursor = 0, limit = 200 } = req.query;
      const result = await syncService.pullChanges(req.tenantId, cursor, limit);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao processar pull de sincronização' });
    }
  }
}

module.exports = new SyncController();
