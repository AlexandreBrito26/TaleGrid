import axios from 'axios';

// ============================================================
// TaleGrid — Auth Service
// Encapsula chamadas ao back-end Spring Boot para autenticação.
// ============================================================

const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use(config => {
  const token = localStorage.getItem('talegrid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redireciona para login se o token expirar
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('talegrid_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Tipos ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// --- Métodos ---
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/login', payload);
    localStorage.setItem('talegrid_token', data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
    localStorage.setItem('talegrid_token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('talegrid_token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('talegrid_token'));
  },
};

export default api;
