import api from './api';

const atendimentoService = {
  listar: async () => {
    const response = await api.get('/ater/atendimentos');
    return response.data;
  },

  detalhar: async (id) => {
    const response = await api.get(`/ater/atendimentos/${id}`);
    return response.data;
  },

  registrar: async (dados) => {
    const response = await api.post('/ater/atendimentos', dados);
    return response.data;
  },

  atualizarTransporte: async (id, payload) => {
    const response = await api.put(`/ater/atendimentos/${id}/transporte`, payload);
    return response.data;
  },

  anexarFotos: async (id, arquivos) => {
    const formData = new FormData();
    arquivos.forEach((arquivo) => formData.append('fotos', arquivo));
    const response = await api.post(`/ater/atendimentos/${id}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  removerFoto: async (fotoId) => {
    const response = await api.delete(`/ater/atendimentos/fotos/${fotoId}`);
    return response.data;
  },

  getFotoUrl: (arquivo) => {
    if (!arquivo) {
      return '';
    }
    if (arquivo.startsWith('http://') || arquivo.startsWith('https://')) {
      return arquivo;
    }
    const origin = api.defaults.baseURL.replace('/api', '');
    return `${origin}${arquivo.startsWith('/') ? arquivo : `/${arquivo}`}`;
  },

  listarTecnicos: async () => {
    const response = await api.get('/ater/tecnicos');
    return response.data;
  }
};

export default atendimentoService;
