import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/Spinner/Spinner';
import './LoginPage.scss';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const fillDemo = () => {
    setEmail('demo@talegrid.com');
    setPassword('senha123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('Nome é obrigatório.'); setLoading(false); return; }
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__card">
        {/* Deco mark */}
        <div className="login-page__mark">T</div>
        <h1 className="login-page__title">
          {mode === 'login' ? 'Entrar no TaleGrid' : 'Criar conta'}
        </h1>
        <p className="login-page__subtitle">
          {mode === 'login'
            ? 'Acesse o painel do autor e continue sua história.'
            : 'Junte-se à comunidade de escritores.'}
        </p>

        {error && <div className="login-page__error">{error}</div>}

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="login-page__field">
              <label htmlFor="name">Nome</label>
              <input
                id="name" type="text" autoComplete="name"
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome de autor"
              />
            </div>
          )}

          <div className="login-page__field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email" type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="autor@exemplo.com"
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password">Senha</label>
            <input
              id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="login-page__submit" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {mode === 'login' && (
          <button className="login-page__demo" onClick={fillDemo} type="button">
            Preencher com conta demo
          </button>
        )}

        <div className="login-page__toggle">
          {mode === 'login' ? (
            <>Não tem conta?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}>Registrar-se</button>
            </>
          ) : (
            <>Já tem conta?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}>Entrar</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
