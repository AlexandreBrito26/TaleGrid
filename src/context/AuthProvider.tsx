import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { authService } from '../services/authService';
import type { User } from '../types';

interface Props { children: ReactNode; }

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }
    authService.me()
      .then(setUser)
      .catch(() => {
        import('../services/api').then(({ tokenStorage }) => tokenStorage.remove());
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
