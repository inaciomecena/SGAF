import api from './api';

const atendimentoService = {
  listar: async () => {
    try {
      const response = await api.get('/ater/atendimentos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  detalhar: async (id) => {
    try {
      const response = await api.get(`/ater/atendimentos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registrar: async (dados) => {
    try {
      const response = await api.post('/ater/atendimentos', dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  listarTecnicos: async () => {
    try {
      const response = await api.get('/ater/tecnicos');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default atendimentoService;
