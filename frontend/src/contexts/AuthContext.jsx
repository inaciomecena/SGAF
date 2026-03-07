import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { normalizeRole } from '../utils/roles';

const AuthContext = createContext({});
const normalizeUser = (rawUser) => {
  if (!rawUser) return rawUser;
  return {
    ...rawUser,
    perfil: normalizeRole(rawUser.perfil)
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (storedUser && token && refreshToken) {
      setUser(normalizeUser(JSON.parse(storedUser)));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;
    const normalizedUser = normalizeUser(user);

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);

    return normalizedUser;
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (token, newPassword) => {
    await api.post('/auth/reset-password', { token, newPassword });
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, forgotPassword, resetPassword, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
