import { api, tokenStorage } from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    tokenStorage.set(data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    tokenStorage.set(data.token);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  logout() {
    tokenStorage.remove();
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};
