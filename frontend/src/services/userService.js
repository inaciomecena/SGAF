import api from './api';

const userService = {
  listar: async () => {
    try {
      const response = await api.get('/admin/usuarios');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criar: async (dados) => {
    try {
      const response = await api.post('/admin/usuarios', dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Implementar update e delete se necessário futuramente
};

export default userService;
