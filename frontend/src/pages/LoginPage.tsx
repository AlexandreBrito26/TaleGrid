import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './LoginPage.scss';

type AuthMode = 'login' | 'register';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(mode: AuthMode, form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === 'register' && !form.name.trim()) errors.name = 'Informe seu nome.';
  if (!form.email.trim()) errors.email = 'O e-mail e obrigatorio.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail invalido.';
  if (!form.password) errors.password = 'A senha e obrigatoria.';
  else if (form.password.length < 8) errors.password = 'Minimo de 8 caracteres.';
  if (mode === 'register' && form.password !== form.confirmPassword)
    errors.confirmPassword = 'As senhas nao coincidem.';
  return errors;
}

const quotes = [
  { text: 'Toda historia e uma porta. Cabe ao leitor decidir se vai atravessa-la.', author: 'Arquivos de TaleGrid' },
  { text: 'As palavras sao a magia mais antiga.', author: 'Arquivos de TaleGrid' },
  { text: 'O heroi nao nasce do destino. Nasce da pagina que voce nao larga.', author: 'Arquivos de TaleGrid' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

  const quote = quotes[quoteIndex];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setFieldErrors({});
    setGlobalError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    const errors = validate(mode, form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await authService.login({ email: form.email, password: form.password });
      } else {
        await authService.register({ name: form.name, email: form.email, password: form.password });
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Algo deu errado. Tente novamente.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <aside className="login-art">
        <div className="login-art__bg" aria-hidden="true" />
        <div className="login-art__rune" aria-hidden="true" />
        <div className="login-art__quote">
          <blockquote>{quote.text}</blockquote>
          <cite>-- {quote.author}</cite>
        </div>
      </aside>

      <main className="login-form-panel">
        <div className="login-box">
          <div className="login-box__logo">
            <span className="logo-mark" aria-hidden="true">T</span>
            <span className="logo-name">TaleGrid</span>
          </div>

          <div className="login-box__heading">
            <h1>{mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}</h1>
          </div>
          <p className="login-box__subheading">
            {mode === 'login'
              ? 'Acesse suas historias e continue sua jornada.'
              : 'Junte-se a comunidade e publique suas historias.'}
          </p>

          <div className="auth-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Entrar
            </button>
            <button
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Cadastrar
            </button>
          </div>

          {globalError && <div className="auth-error" role="alert">{globalError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="name">Nome / Pseudonimo</label>
                <input
                  id="name" name="name" type="text" autoComplete="name"
                  placeholder="Como devemos te chamar?"
                  value={form.name} onChange={handleChange}
                  className={fieldErrors.name ? 'error' : ''}
                />
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                placeholder="seu@email.com"
                value={form.email} onChange={handleChange}
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="password">Senha</label>
              <input
                id="password" name="password" type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'login' ? '........' : 'Minimo 8 caracteres'}
                value={form.password} onChange={handleChange}
                className={fieldErrors.password ? 'error' : ''}
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password"
                  autoComplete="new-password" placeholder="Repita a senha"
                  value={form.confirmPassword} onChange={handleChange}
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                />
                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading
                ? (mode === 'login' ? 'Entrando...' : 'Criando conta...')
                : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>
          </form>

          {mode === 'login' && (
            <>
              <div className="auth-divider">ou</div>
              <p className="login-footer">
                Nao tem uma conta?{' '}
                <a href="#register" onClick={e => { e.preventDefault(); switchMode('register'); }}>
                  Cadastre-se gratuitamente
                </a>
              </p>
            </>
          )}
          {mode === 'register' && (
            <p className="login-footer" style={{ marginTop: '16px' }}>
              Ja tem conta?{' '}
              <a href="#login" onClick={e => { e.preventDefault(); switchMode('login'); }}>
                Faca login
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
