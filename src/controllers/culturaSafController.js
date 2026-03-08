const culturaSafService = require('../services/culturaSafService');

class CulturaSafController {
  async listar(req, res) {
    try {
      const culturas = await culturaSafService.listar({
        search: req.query.search || '',
        categoria: req.query.categoria || '',
        tipo_ciclo: req.query.tipo_ciclo || ''
      });
      return res.json(culturas);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar culturas' });
    }
  }

  async criar(req, res) {
    try {
      const { nome_cultura } = req.body;
      if (!nome_cultura) {
        return res.status(400).json({ message: 'Nome da cultura é obrigatório' });
      }

      const id = await culturaSafService.criar(req.body);
      return res.status(201).json({ id, message: 'Cultura cadastrada com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao cadastrar cultura' });
    }
  }

  async detalhar(req, res) {
    try {
      const cultura = await culturaSafService.detalhar(req.params.id);
      if (!cultura) {
        return res.status(404).json({ message: 'Cultura não encontrada' });
      }
      return res.json(cultura);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao detalhar cultura' });
    }
  }

  async atualizar(req, res) {
    try {
      const { nome_cultura } = req.body;
      if (!nome_cultura) {
        return res.status(400).json({ message: 'Nome da cultura é obrigatório' });
      }

      const atualizado = await culturaSafService.atualizar(req.params.id, req.body);
      if (!atualizado) {
        return res.status(404).json({ message: 'Cultura não encontrada' });
      }

      return res.json({ message: 'Cultura atualizada com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar cultura' });
    }
  }
}

module.exports = new CulturaSafController();
