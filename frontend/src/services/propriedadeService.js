import api from './api';

const propriedadeService = {
  listar: async () => {
    try {
      const response = await api.get('/propriedades');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criar: async (produtorId, dados) => {
    try {
      const response = await api.post(`/produtores/${produtorId}/propriedades`, dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default propriedadeService;
