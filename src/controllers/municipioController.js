const municipioService = require('../services/municipioService');

class MunicipioController {
  async listar(req, res) {
    try {
      const municipios = await municipioService.listarTodos();
      res.json(municipios);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar municípios' });
    }
  }

  async criar(req, res) {
    try {
      const id = await municipioService.criar(req.body);
      res.status(201).json({ id, message: 'Município criado com sucesso' });
    } catch (error) {
      if (error.message.includes('já cadastrado')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro ao criar município' });
    }
  }
}

module.exports = new MunicipioController();
