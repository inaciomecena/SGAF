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

  listarAgendamentos: async (params) => {
    const response = await api.get('/recursos/agendamentos', { params });
    return response.data;
  },

  obterAgendamento: async (id) => {
    const response = await api.get(`/recursos/agendamentos/${id}`);
    return response.data;
  },

  criarAgendamento: async (dados) => {
    const response = await api.post('/recursos/agendamentos', dados);
    return response.data;
  },

  atualizarAgendamento: async (id, dados) => {
    const response = await api.put(`/recursos/agendamentos/${id}`, dados);
    return response.data;
  },

  removerAgendamento: async (id) => {
    await api.delete(`/recursos/agendamentos/${id}`);
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
