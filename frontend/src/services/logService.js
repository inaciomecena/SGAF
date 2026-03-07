import api from './api';

const logService = {
  listarAcessos: async ({ codigo_ibge, limit } = {}) => {
    const response = await api.get('/admin/logs/acesso', {
      params: {
        codigo_ibge,
        limit
      }
    });
    return response.data;
  },

  listarSistema: async ({ codigo_ibge, limit } = {}) => {
    const response = await api.get('/admin/logs/sistema', {
      params: {
        codigo_ibge,
        limit
      }
    });
    return response.data;
  }
};

export default logService;
