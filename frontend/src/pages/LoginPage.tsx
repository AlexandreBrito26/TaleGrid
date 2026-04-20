import React, { useState } from 'react';
import './LoginPage.scss';

// ============================================================
// Tipos
// ============================================================
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

// ============================================================
// Validação
// ============================================================
function validate(mode: AuthMode, form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (mode === 'register' && !form.name.trim()) {
    errors.name = 'Informe seu nome ou pseudônimo.';
  }

  if (!form.email.trim()) {
    errors.email = 'O e-mail é obrigatório.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'E-mail inválido.';
  }

  if (!form.password) {
    errors.password = 'A senha é obrigatória.';
  } else if (form.password.length < 8) {
    errors.password = 'Mínimo de 8 caracteres.';
  }

  if (mode === 'register' && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  return errors;
}

// ============================================================
// Quotes que aparecem no painel de arte
// ============================================================
const quotes = [
  { text: 'Toda história é uma porta. Cabe ao leitor decidir se vai atravessá-la.', author: 'Arquivos de TaleGrid' },
  { text: 'As palavras são a magia mais antiga — e a única que não precisa de grimório.', author: 'Arquivos de TaleGrid' },
  { text: 'O herói não nasce do destino. Nasce da página que você não larga.', author: 'Arquivos de TaleGrid' },
];

// ============================================================
// Componente principal
// ============================================================
export default function LoginPage() {
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
    // Limpa erro do campo ao digitar
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
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      
     const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
     const response = await authService.post(endpoint, { ...form });
     navigate('/dashboard');
      setGlobalError(err?.message ?? 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      {/* ── Painel de arte (esquerdo) ── */}
      <aside className="login-art">
        <div className="login-art__bg" aria-hidden="true" />
        <div className="login-art__rune" aria-hidden="true" />
        <div className="login-art__quote">
          <blockquote>{quote.text}</blockquote>
          <cite>— {quote.author}</cite>
        </div>
      </aside>

      {/* ── Painel do formulário (direito) ── */}
      <main className="login-form-panel">
        <div className="login-box">

          {/* Logo */}
          <div className="login-box__logo">
            <span className="logo-mark" aria-hidden="true">T</span>
            <span className="logo-name">TaleGrid</span>
          </div>

          {/* Título */}
          <div className="login-box__heading">
            <h1>{mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}</h1>
          </div>
          <p className="login-box__subheading">
            {mode === 'login'
              ? 'Acesse suas histórias e continue sua jornada.'
              : 'Junte-se à comunidade e publique suas histórias.'}
          </p>

          {/* Toggle Login / Cadastro */}
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

          {/* Erro global */}
          {globalError && (
            <div className="auth-error" role="alert">{globalError}</div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate>

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="name">Nome / Pseudônimo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Como devemos te chamar?"
                  value={form.name}
                  onChange={handleChange}
                  className={fieldErrors.name ? 'error' : ''}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name && (
                  <span id="name-error" className="field-error">{fieldErrors.name}</span>
                )}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? 'error' : ''}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="email-error" className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'login' ? '••••••••' : 'Mínimo 8 caracteres'}
                value={form.password}
                onChange={handleChange}
                className={fieldErrors.password ? 'error' : ''}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              {fieldErrors.password && (
                <span id="password-error" className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
                />
                {fieldErrors.confirmPassword && (
                  <span id="confirm-error" className="field-error">{fieldErrors.confirmPassword}</span>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading
                ? (mode === 'login' ? 'Entrando…' : 'Criando conta…')
                : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>

          </form>

          {mode === 'login' && (
            <>
              <div className="auth-divider">ou</div>
              <p className="login-footer">
                Não tem uma conta?{' '}
                <a href="#register" onClick={e => { e.preventDefault(); switchMode('register'); }}>
                  Cadastre-se gratuitamente
                </a>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p className="login-footer" style={{ marginTop: '16px' }}>
              Já tem conta?{' '}
              <a href="#login" onClick={e => { e.preventDefault(); switchMode('login'); }}>
                Faça login
              </a>
            </p>
          )}

        </div>
      </main>
    </div>
  );
}
