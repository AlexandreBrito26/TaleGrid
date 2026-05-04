import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authorStoryService } from '../../services/storyService';
import Spinner from '../../components/Spinner/Spinner';
import type { Story } from '../../types';
import './DashboardPage.scss';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchStories = useCallback(() => {
    setLoading(true);
    authorStoryService.list()
      .then(setStories)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Deletar "${title}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    await authorStoryService.delete(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    const updated = await authorStoryService.togglePublish(id);
    setStories((prev) => prev.map((s) => s.id === id ? updated : s));
    setTogglingId(null);
  };

  return (
    <main className="dashboard">
      <div className="dashboard__inner">
        <header className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Painel do Autor</h1>
            <p className="dashboard__welcome">Bem-vindo, {user?.name}</p>
          </div>
          <button className="dashboard__new-btn" onClick={() => navigate('/dashboard/stories/new')}>
            + Nova história
          </button>
        </header>

        {loading ? (
          <div className="dashboard__loading"><Spinner size="lg" /></div>
        ) : stories.length === 0 ? (
          <div className="dashboard__empty">
            <span className="dashboard__empty-icon">✦</span>
            <p>Nenhuma história criada ainda.</p>
            <button className="dashboard__new-btn" onClick={() => navigate('/dashboard/stories/new')}>
              Criar primeira história
            </button>
          </div>
        ) : (
          <div className="dashboard__list">
            {stories.map((s) => (
              <div key={s.id} className="dashboard__story-card">
                <div className="dashboard__story-info">
                  <div className="dashboard__story-header">
                    <h2 className="dashboard__story-title">{s.title}</h2>
                    <span className={`dashboard__badge ${s.published ? 'dashboard__badge--pub' : 'dashboard__badge--draft'}`}>
                      {s.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  {s.genre && <span className="dashboard__story-genre">{s.genre}</span>}
                  <div className="dashboard__story-stats">
                    <span>{s.chapterCount} capítulo{s.chapterCount !== 1 ? 's' : ''}</span>
                    <span className="dashboard__dot">·</span>
                    <span>{s.viewCount.toLocaleString('pt-BR')} leituras</span>
                  </div>
                </div>

                <div className="dashboard__story-actions">
                  <button
                    className="dashboard__action-btn dashboard__action-btn--chapters"
                    onClick={() => navigate(`/dashboard/stories/${s.id}/chapters/new`)}
                  >
                    + Capítulo
                  </button>
                  <button
                    className="dashboard__action-btn"
                    onClick={() => navigate(`/dashboard/stories/${s.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button
                    className="dashboard__action-btn dashboard__action-btn--publish"
                    onClick={() => handleTogglePublish(s.id)}
                    disabled={togglingId === s.id}
                  >
                    {togglingId === s.id ? <Spinner size="sm" /> : s.published ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    className="dashboard__action-btn dashboard__action-btn--delete"
                    onClick={() => handleDelete(s.id, s.title)}
                    disabled={deletingId === s.id}
                  >
                    {deletingId === s.id ? <Spinner size="sm" /> : 'Deletar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
