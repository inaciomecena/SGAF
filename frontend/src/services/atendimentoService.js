import api from './api';

const atendimentoService = {
  listar: async () => {
    const response = await api.get('/ater/atendimentos');
    return response.data;
  },

  detalhar: async (id) => {
    const response = await api.get(`/ater/atendimentos/${id}`);
    return response.data;
  },

  registrar: async (dados) => {
    const response = await api.post('/ater/atendimentos', dados);
    return response.data;
  },

  listarTecnicos: async () => {
    const response = await api.get('/ater/tecnicos');
    return response.data;
  }
};

export default atendimentoService;
