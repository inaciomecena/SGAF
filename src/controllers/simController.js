const simService = require('../services/simService');

class SimController {
  async obterTudo(req, res) {
    try {
      const result = await simService.obterTudo({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge,
        ano: req.query.ano
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível carregar os dados do SIM.' });
    }
  }

  async salvarInfo(req, res) {
    try {
      const result = await simService.salvarInfo({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge,
        body: req.body
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível salvar os dados do SIM.' });
    }
  }

  async salvarFeiras(req, res) {
    try {
      const result = await simService.salvarFeiras({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge,
        ano: req.query.ano,
        body: req.body
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível salvar os dados de feiras.' });
    }
  }

  async salvarTipoFeira(req, res) {
    try {
      const result = await simService.salvarTipoFeira({
        user: req.user,
        tenantId: req.tenantId,
        codigoIbgeParam: req.query.codigo_ibge,
        ano: req.query.ano,
        tipoFeira: req.params.tipo,
        body: req.body
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Não foi possível salvar os dados do tipo de feira.' });
    }
  }
}

module.exports = new SimController();

