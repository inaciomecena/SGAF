const frotaService = require('../services/frotaService');
const syncService = require('../services/syncService'); // Para eventos de sincronização se necessário

const frotaController = {
  // Veículos
  listarVeiculos: async (req, res) => {
    try {
      const codigoIbge = req.tenantId; // Do middleware tenant
      
      if (codigoIbge === undefined) {
        throw new Error('codigoIbge (tenantId) is undefined');
      }

      const veiculos = await frotaService.listarVeiculos(codigoIbge);
      res.json(veiculos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar veículos' });
    }
  },

  criarVeiculo: async (req, res) => {
    try {
      const codigoIbge = req.tenantId;
      
      if (codigoIbge === undefined) {
        throw new Error('codigoIbge (tenantId) is undefined');
      }

      const veiculoId = await frotaService.criarVeiculo({ ...req.body, codigo_ibge: codigoIbge });
      res.status(201).json({ id: veiculoId, message: 'Veículo criado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar veículo' });
    }
  },

  atualizarVeiculo: async (req, res) => {
    try {
      const { id } = req.params;
      await frotaService.atualizarVeiculo(id, req.body);
      res.json({ message: 'Veículo atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar veículo' });
    }
  },

  removerVeiculo: async (req, res) => {
    try {
      const { id } = req.params;
      await frotaService.removerVeiculo(id);
      res.json({ message: 'Veículo removido com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao remover veículo' });
    }
  },

  // Abastecimentos
  listarAbastecimentos: async (req, res) => {
    try {
      const { veiculoId } = req.params;
      const abastecimentos = await frotaService.listarAbastecimentos(veiculoId);
      res.json(abastecimentos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar abastecimentos' });
    }
  },

  registrarAbastecimento: async (req, res) => {
    try {
      const abastecimentoId = await frotaService.registrarAbastecimento({
        ...req.body,
        motorista_id: req.user.id // Do middleware auth
      });
      res.status(201).json({ id: abastecimentoId, message: 'Abastecimento registrado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao registrar abastecimento' });
    }
  }
};

module.exports = frotaController;
