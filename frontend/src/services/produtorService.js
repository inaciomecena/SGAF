import api from './api';

const produtorService = {
  listar: async () => {
    try {
      const response = await api.get('/produtores');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  detalhar: async (id) => {
    try {
      const response = await api.get(`/produtores/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criar: async (dados) => {
    try {
      // dados deve conter { produtor: {...}, endereco: {...} }
      const response = await api.post('/produtores', dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default produtorService;
