const pmafService = require('../services/pmafService');

class PmafController {
  async obterInfo(req, res) {
    try {
      const result = await pmafService.obterInfo({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível carregar os dados do PMAF.' });
    }
  }

  async listar(req, res) {
    try {
      const result = await pmafService.listar({ user: req.user });
      res.json(result);
    } catch (error) {
      res.status(403).json({ message: error.message || 'Acesso negado.' });
    }
  }

  async salvarInfo(req, res) {
    try {
      const result = await pmafService.salvarInfo({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge,
        body: req.body,
        file: req.file
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível salvar os dados do PMAF.' });
    }
  }

  async removerInfo(req, res) {
    try {
      const ok = await pmafService.removerInfo({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge
      });
      res.json({ success: ok });
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível remover os dados do PMAF.' });
    }
  }
}

module.exports = new PmafController();

