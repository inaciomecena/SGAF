import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'sgaf_token';
const USER_KEY = 'sgaf_user';
const CURSOR_KEY = 'sgaf_sync_cursor';

export const storage = {
  async setToken(token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async clearToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
  async setUser(user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  async clearUser() {
    await AsyncStorage.removeItem(USER_KEY);
  },
  async setCursor(cursor) {
    await AsyncStorage.setItem(CURSOR_KEY, String(cursor || 0));
  },
  async getCursor() {
    const raw = await AsyncStorage.getItem(CURSOR_KEY);
    return raw ? Number(raw) : 0;
  }
};
