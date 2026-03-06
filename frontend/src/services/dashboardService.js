import api from './api';

const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dashboardService;
