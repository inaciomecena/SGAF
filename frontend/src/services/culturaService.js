import api from './api';

const culturaService = {
  listar: async (params) => {
    const response = await api.get('/tabelas/culturas', { params });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/tabelas/culturas', dados);
    return response.data;
  }
};

export default culturaService;
