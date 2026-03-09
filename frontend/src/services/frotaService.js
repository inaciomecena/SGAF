import api from './api';

const frotaService = {
  // Veículos
  listarVeiculos: async () => {
    const response = await api.get('/frota/veiculos');
    return response.data;
  },

  criarVeiculo: async (dados) => {
    const response = await api.post('/frota/veiculos', dados);
    return response.data;
  },

  atualizarVeiculo: async (id, dados) => {
    const response = await api.put(`/frota/veiculos/${id}`, dados);
    return response.data;
  },

  removerVeiculo: async (id) => {
    const response = await api.delete(`/frota/veiculos/${id}`);
    return response.data;
  },

  // Abastecimentos
  listarAbastecimentos: async (veiculoId) => {
    const response = await api.get(`/frota/veiculos/${veiculoId}/abastecimentos`);
    return response.data;
  },

  registrarAbastecimento: async (dados) => {
    const response = await api.post('/frota/abastecimentos', dados);
    return response.data;
  }
};

export default frotaService;
