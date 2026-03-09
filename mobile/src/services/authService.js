import api from './api';
import { storage } from './storage';

export const authService = {
  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    const token = response.data?.token;
    const user = response.data?.user;
    if (!token || !user) {
      throw new Error('Resposta de autenticação inválida');
    }
    await storage.setToken(token);
    await storage.setUser(user);
    return user;
  },

  async logout() {
    await storage.clearToken();
    await storage.clearUser();
  },

  async currentUser() {
    return storage.getUser();
  }
};
