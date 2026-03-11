import api from './api';

const pmafService = {
  listar: async () => {
    const response = await api.get('/pmaf');
    return response.data;
  },

  obterInfo: async (codigoIbge) => {
    const response = await api.get('/pmaf/info', {
      params: codigoIbge ? { codigo_ibge: codigoIbge } : undefined
    });
    return response.data;
  },

  salvarInfo: async (codigoIbge, payload) => {
    const params = codigoIbge ? { codigo_ibge: codigoIbge } : undefined;
    const response = await api.put('/pmaf/info', payload, {
      params,
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  },

  removerInfo: async (codigoIbge) => {
    const response = await api.delete('/pmaf/info', {
      params: codigoIbge ? { codigo_ibge: codigoIbge } : undefined
    });
    return response.data;
  }
};

export default pmafService;

