import api from './api';

const recursoService = {
  listarMaquinas: async () => {
    const response = await api.get('/recursos/maquinas');
    return response.data;
  },

  criarMaquina: async (dados) => {
    const response = await api.post('/recursos/maquinas', dados);
    return response.data;
  },

  listarAgendamentos: async () => {
    const response = await api.get('/recursos/agendamentos');
    return response.data;
  },

  criarAgendamento: async (dados) => {
    const response = await api.post('/recursos/agendamentos', dados);
    return response.data;
  },

  listarInsumos: async () => {
    const response = await api.get('/recursos/insumos');
    return response.data;
  },

  criarInsumo: async (dados) => {
    const response = await api.post('/recursos/insumos', dados);
    return response.data;
  }
};

export default recursoService;
