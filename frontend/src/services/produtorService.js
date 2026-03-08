import api from './api';

const produtorService = {
  listar: async () => {
    const response = await api.get('/rural/produtores');
    return response.data;
  },

  detalhar: async (id) => {
    const response = await api.get(`/rural/produtores/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/rural/produtores', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/rural/produtores/${id}`, dados);
    return response.data;
  },
};

export default produtorService;
