import api from './api';

const simService = {
  obterTudo: async (ano, codigoIbge) => {
    const params = { ano };
    if (codigoIbge) params.codigo_ibge = codigoIbge;
    const response = await api.get('/sim', { params });
    return response.data;
  },

  salvarInfo: async (payload, codigoIbge) => {
    const response = await api.put('/sim/info', payload, {
      params: codigoIbge ? { codigo_ibge: codigoIbge } : undefined
    });
    return response.data;
  },

  salvarFeiras: async (ano, payload, codigoIbge) => {
    const params = { ano };
    if (codigoIbge) params.codigo_ibge = codigoIbge;
    const response = await api.put('/sim/feiras', payload, { params });
    return response.data;
  },

  salvarTipoFeira: async (ano, tipo, payload, codigoIbge) => {
    const params = { ano };
    if (codigoIbge) params.codigo_ibge = codigoIbge;
    const response = await api.put(`/sim/tipos-feiras/${tipo}`, payload, { params });
    return response.data;
  }
};

export default simService;

