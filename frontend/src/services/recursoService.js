import api from './api';

const recursoService = {
  // --- MÁQUINAS ---
  listarMaquinas: async () => {
    try {
      const response = await api.get('/recursos/maquinas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criarMaquina: async (dados) => {
    try {
      const response = await api.post('/recursos/maquinas', dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // --- AGENDAMENTOS ---
  listarAgendamentos: async () => {
    try {
      const response = await api.get('/recursos/agendamentos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criarAgendamento: async (dados) => {
    try {
      const response = await api.post('/recursos/agendamentos', dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // --- INSUMOS ---
  listarInsumos: async () => {
    try {
      const response = await api.get('/recursos/insumos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criarInsumo: async (dados) => {
    try {
      const response = await api.post('/recursos/insumos', dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default recursoService;
