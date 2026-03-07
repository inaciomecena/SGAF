import api from './api';

const userService = {
  listar: async (codigoIbge) => {
    const response = await api.get('/admin/usuarios', {
      params: codigoIbge ? { codigo_ibge: codigoIbge } : undefined
    });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/admin/usuarios', dados);
    return response.data;
  },

  detalhar: async (id) => {
    const response = await api.get(`/admin/usuarios/${id}`);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/admin/usuarios/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    const response = await api.delete(`/admin/usuarios/${id}`);
    return response.data;
  },
};

export default userService;
