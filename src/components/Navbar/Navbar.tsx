import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.scss';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
        <span className="navbar__mark">T</span>
        TaleGrid
      </div>
      <div className="navbar__actions">
        {isAuthenticated ? (
          <>
            <button className="navbar__link" onClick={() => navigate('/dashboard')}>
              Painel do autor
            </button>
            <button className="navbar__link navbar__link--ghost" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <button className="navbar__link" onClick={() => navigate('/login')}>
              Entrar
            </button>
            <button
              className="navbar__link navbar__link--cta"
              onClick={() => navigate('/login')}
            >
              Publicar
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
