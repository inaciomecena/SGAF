const produtorService = require('../services/produtorService');
const propriedadeRepository = require('../repositories/propriedadeRepository');
const culturaSafService = require('../services/culturaSafService');

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

  async listarPropriedadesPorProdutor(req, res) {
    try {
      const { produtorId } = req.params;
      const propriedades = await propriedadeRepository.findAllByProdutor(produtorId, req.tenantId);
      res.json(propriedades);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar propriedades do produtor' });
    }
  }

  async detalharPropriedade(req, res) {
    try {
      const { id } = req.params;
      const propriedade = await propriedadeRepository.findById(id, req.tenantId);
      if (!propriedade) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }
      res.json(propriedade);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar propriedade' });
    }
  }

  async atualizarPropriedade(req, res) {
    try {
      const { id } = req.params;
      const existe = await propriedadeRepository.findById(id, req.tenantId);
      if (!existe) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }

      const atualizado = await propriedadeRepository.update(id, req.tenantId, req.body);
      if (!atualizado) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }

      const propriedade = await propriedadeRepository.findById(id, req.tenantId);
      res.json({ message: 'Propriedade atualizada com sucesso', propriedade });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar propriedade' });
    }
  }

  async excluirPropriedade(req, res) {
    try {
      const { id } = req.params;
      const removido = await propriedadeRepository.delete(id, req.tenantId);
      if (!removido) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir propriedade' });
    }
  }

  async listarCulturasDisponiveis(req, res) {
    try {
      await culturaSafService.inicializarBase();
      const culturas = await propriedadeRepository.findCulturas();
      res.json(culturas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar culturas' });
    }
  }

  async listarCulturasPropriedade(req, res) {
    try {
      await culturaSafService.inicializarBase();
      const { id } = req.params;
      const propriedade = await propriedadeRepository.findById(id, req.tenantId);
      if (!propriedade) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }

      const producoes = await propriedadeRepository.findCulturasByPropriedade(id, req.tenantId);
      res.json(producoes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar produções da propriedade' });
    }
  }

  async adicionarCulturaPropriedade(req, res) {
    try {
      await culturaSafService.inicializarBase();
      const { id } = req.params;
      const propriedade = await propriedadeRepository.findById(id, req.tenantId);
      if (!propriedade) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }

      const culturaRegistroId = await propriedadeRepository.addCulturaNaPropriedade({
        ...req.body,
        propriedade_id: id
      });

      res.status(201).json({ id: culturaRegistroId, message: 'Produção adicionada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao adicionar produção da propriedade' });
    }
  }

  async atualizarCulturaPropriedade(req, res) {
    try {
      await culturaSafService.inicializarBase();
      const { id, culturaRegistroId } = req.params;
      const propriedade = await propriedadeRepository.findById(id, req.tenantId);
      if (!propriedade) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }

      const atualizado = await propriedadeRepository.updateCulturaDaPropriedade(culturaRegistroId, id, req.tenantId, req.body);
      if (!atualizado) {
        return res.status(404).json({ message: 'Produção não encontrada' });
      }

      res.json({ message: 'Produção atualizada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar produção da propriedade' });
    }
  }

  async excluirCulturaPropriedade(req, res) {
    try {
      await culturaSafService.inicializarBase();
      const { id, culturaRegistroId } = req.params;
      const propriedade = await propriedadeRepository.findById(id, req.tenantId);
      if (!propriedade) {
        return res.status(404).json({ message: 'Propriedade não encontrada' });
      }

      const removido = await propriedadeRepository.deleteCulturaDaPropriedade(culturaRegistroId, id, req.tenantId);
      if (!removido) {
        return res.status(404).json({ message: 'Produção não encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir produção da propriedade' });
    }
  }
}

module.exports = new ProdutorController();
