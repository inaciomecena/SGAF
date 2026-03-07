import api from './api';

const municipioService = {
  listar: async () => {
    const response = await api.get('/admin/municipios');
    return response.data;
  },
  criar: async (dados) => {
    const response = await api.post('/admin/municipios', dados);
    return response.data;
  }
};

export default municipioService;
