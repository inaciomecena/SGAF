import api from './api';

const propriedadeService = {
  listar: async () => {
    const response = await api.get('/rural/propriedades');
    return response.data;
  },

  listarPorProdutor: async (produtorId) => {
    const response = await api.get(`/rural/produtores/${produtorId}/propriedades`);
    return response.data;
  },

  criar: async (produtorId, dados) => {
    const response = await api.post(`/rural/produtores/${produtorId}/propriedades`, dados);
    return response.data;
  },

  detalhar: async (id) => {
    const response = await api.get(`/rural/propriedades/${id}`);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/rural/propriedades/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/rural/propriedades/${id}`);
    return response.data;
  },

  listarCulturasDisponiveis: async () => {
    const response = await api.get('/rural/culturas');
    return response.data;
  },

  listarCulturasPropriedade: async (propriedadeId) => {
    const response = await api.get(`/rural/propriedades/${propriedadeId}/culturas`);
    return response.data;
  },

  adicionarCulturaPropriedade: async (propriedadeId, dados) => {
    const response = await api.post(`/rural/propriedades/${propriedadeId}/culturas`, dados);
    return response.data;
  },

  atualizarCulturaPropriedade: async (propriedadeId, culturaRegistroId, dados) => {
    const response = await api.put(`/rural/propriedades/${propriedadeId}/culturas/${culturaRegistroId}`, dados);
    return response.data;
  },

  excluirCulturaPropriedade: async (propriedadeId, culturaRegistroId) => {
    const response = await api.delete(`/rural/propriedades/${propriedadeId}/culturas/${culturaRegistroId}`);
    return response.data;
  },
};

export default propriedadeService;
