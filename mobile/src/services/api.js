import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import { storage } from './storage';

const normalizeHost = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().replace(/^https?:\/\//, '');
  if (!trimmed) {
    return null;
  }
  return trimmed.split('/')[0].split(':')[0] || null;
};

const getDevHostFromMetro = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) {
    return null;
  }
  const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
  return normalizeHost(match?.[1] || null);
};

const isPrivateIPv4 = (host) => {
  if (!host || typeof host !== 'string') {
    return false;
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return true;
  }
  const parts = host.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }
  if (parts[0] === 10) {
    return true;
  }
  if (parts[0] === 192 && parts[1] === 168) {
    return true;
  }
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }
  return false;
};

const resolveBaseURL = () => {
  const explicitBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicitBaseURL) {
    return explicitBaseURL;
  }
  const envHost = normalizeHost(process.env.EXPO_PUBLIC_API_HOST);
  const metroHost = getDevHostFromMetro();
  const lanHost = normalizeHost(process.env.EXPO_PUBLIC_LAN_HOST) || '192.168.1.9';
  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const preferredMetroHost = metroHost && isPrivateIPv4(metroHost) ? metroHost : null;
  const host = envHost || preferredMetroHost || (Platform.OS === 'android' ? lanHost : null) || fallbackHost;
  const port = process.env.EXPO_PUBLIC_API_PORT || '3000';
  return `http://${host}:${port}/api`;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
