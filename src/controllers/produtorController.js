const produtorService = require('../services/produtorService');
const propriedadeRepository = require('../repositories/propriedadeRepository');

class ProdutorController {
  async listar(req, res) {
    try {
      const produtores = await produtorService.listarProdutores(req.tenantId);
      res.json(produtores);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar produtores' });
    }
  }

  async criar(req, res) {
    try {
      const { produtor, endereco } = req.body;
      const codigo_ibge = req.tenantId;

      const id = await produtorService.criarProdutor(
        { ...produtor, codigo_ibge },
        endereco
      );
      
      res.status(201).json({ id, message: 'Produtor cadastrado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao cadastrar produtor' });
    }
  }

  async detalhar(req, res) {
    try {
      const { id } = req.params;
      const produtor = await produtorService.detalharProdutor(id, req.tenantId);
      
      if (!produtor) {
        return res.status(404).json({ message: 'Produtor não encontrado' });
      }

      res.json(produtor);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar produtor' });
    }
  }

  async criarPropriedade(req, res) {
    try {
      const { produtorId } = req.params;
      const propriedadeData = req.body;
      const codigo_ibge = req.tenantId;

      const id = await propriedadeRepository.create({
        ...propriedadeData,
        produtor_id: produtorId,
        codigo_ibge
      });

      res.status(201).json({ id, message: 'Propriedade cadastrada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao cadastrar propriedade' });
    }
  }

  async listarPropriedades(req, res) {
    try {
      const propriedades = await propriedadeRepository.findAllByIbge(req.tenantId);
      res.json(propriedades);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar propriedades' });
    }
  }
}

module.exports = new ProdutorController();
