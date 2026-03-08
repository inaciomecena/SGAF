import api from './api';

const culturaService = {
  listar: async (params) => {
    const response = await api.get('/tabelas/culturas', { params });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/tabelas/culturas', dados);
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/tabelas/culturas/${id}`);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/tabelas/culturas/${id}`, dados);
    return response.data;
  }
};

export default culturaService;
