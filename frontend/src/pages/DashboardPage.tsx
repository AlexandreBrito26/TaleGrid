import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorStoryService, StoryResponse, CreateStoryRequest } from '../services/storyService';
import { authService } from '../services/authService';
import './DashboardPage.scss';

// ── Ícones ────────────────────────────────────────────────────

const IconBook    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconPlus    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconGlobe   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconEdit    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconLogout  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconEye     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const GENRES = ['RPG', 'Fantasia', 'Ficção Científica', 'Aventura', 'Terror', 'Romance', 'Mistério', 'Outro'];

// ── Modal de criação/edição ───────────────────────────────────

interface StoryModalProps {
  initial?: StoryResponse;
  onSave: (req: CreateStoryRequest) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function StoryModal({ initial, onSave, onClose, saving }: StoryModalProps) {
  const [form, setForm] = useState<CreateStoryRequest>({
    title:       initial?.title       ?? '',
    description: initial?.description ?? '',
    genre:       initial?.genre       ?? 'Fantasia',
  });

  function change(field: keyof CreateStoryRequest, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{initial ? 'Editar história' : 'Nova história'}</h2>

        <div className="form-field">
          <label>Título</label>
          <input
            type="text"
            placeholder="O nome da sua obra"
            value={form.title}
            onChange={e => change('title', e.target.value)}
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="form-field">
          <label>Gênero</label>
          <select value={form.genre} onChange={e => change('genre', e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label>Descrição</label>
          <textarea
            placeholder="Do que se trata esta história? Dê uma sinopse que conquiste o leitor…"
            value={form.description}
            onChange={e => change('description', e.target.value)}
            maxLength={2000}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          <button
            className="btn-primary-sm"
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim()}
          >
            {saving ? 'Salvando…' : initial ? 'Salvar alterações' : 'Criar história'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stories, setStories]         = useState<StoryResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<StoryResponse | null>(null);
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authorStoryService.list();
      setStories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Ações ──────────────────────────────────────────────────

  async function handleSave(req: CreateStoryRequest) {
    setSaving(true);
    try {
      if (editing) {
        const updated = await authorStoryService.update(editing.id, req);
        setStories(s => s.map(x => x.id === updated.id ? updated : x));
      } else {
        const created = await authorStoryService.create(req);
        setStories(s => [created, ...s]);
      }
      setModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(id: string) {
    const updated = await authorStoryService.togglePublish(id);
    setStories(s => s.map(x => x.id === updated.id ? updated : x));
  }

  async function handleDelete(id: string) {
    await authorStoryService.delete(id);
    setStories(s => s.filter(x => x.id !== id));
    setConfirmDelete(null);
  }

  // ── Stats ──────────────────────────────────────────────────

  const totalChapters  = stories.reduce((n, s) => n + s.chapterCount, 0);
  const publishedCount = stories.filter(s => s.published).length;
  const draftCount     = stories.length - publishedCount;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="dashboard">
      <div className="dash-layout">

        {/* ── Sidebar ── */}
        <aside className="dash-sidebar">
          <div style={{ padding: '0 8px 24px', borderBottom: '1px solid var(--color-border, rgba(201,153,74,.18))' }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 700, color: '#f0ead8', marginBottom: 4 }}>TaleGrid</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#5a5248' }}>Painel do autor</div>
          </div>

          <span className="sidebar-section">Conteúdo</span>
          <button className="sidebar-item active"><IconBook /> Minhas histórias</button>
          <button className="sidebar-item" onClick={() => navigate('/')}><IconGlobe /> Feed público</button>

          <span className="sidebar-section">Conta</span>
          <button className="sidebar-item" onClick={() => authService.logout()}><IconLogout /> Sair</button>
        </aside>

        {/* ── Main ── */}
        <main className="dash-main">

          {/* Top bar */}
          <div className="dash-topbar">
            <div>
              <h1>Minhas histórias</h1>
              <p className="topbar-sub">Gerencie suas obras e capítulos</p>
            </div>
            <button className="btn-primary-sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
              + Nova história
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__label">Total de obras</div>
              <div className="stat-card__value">{stories.length}</div>
              <div className="stat-card__sub">histórias criadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Publicadas</div>
              <div className="stat-card__value gold">{publishedCount}</div>
              <div className="stat-card__sub">visíveis no feed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Rascunhos</div>
              <div className="stat-card__value">{draftCount}</div>
              <div className="stat-card__sub">em desenvolvimento</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Capítulos</div>
              <div className="stat-card__value">{totalChapters}</div>
              <div className="stat-card__sub">no total</div>
            </div>
          </div>

          {/* Lista de histórias */}
          <div className="section-header">
            <h2>Suas obras</h2>
          </div>

          {loading ? (
            <div style={{ color: '#5a5248', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem' }}>Carregando…</div>
          ) : stories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📖</div>
              <h3>Nenhuma história ainda</h3>
              <p>Crie sua primeira obra e comece a publicar capítulos.</p>
              <button className="btn-primary-sm" onClick={() => setModalOpen(true)}>
                + Criar primeira história
              </button>
            </div>
          ) : (
            <div className="story-list">
              {stories.map(story => (
                <div key={story.id} className="dash-story-card">
                  <div className="dash-story-card__info">
                    <div className="dash-story-card__title">{story.title}</div>
                    <div className="dash-story-card__meta">
                      <span className={`status-badge status-badge--${story.published ? 'published' : 'draft'}`}>
                        {story.published ? 'Publicada' : 'Rascunho'}
                      </span>
                      {story.genre && <span className="genre-tag">{story.genre}</span>}
                      <span>{story.chapterCount} capítulo{story.chapterCount !== 1 ? 's' : ''}</span>
                    </div>
                    {story.description && (
                      <div className="dash-story-card__desc">{story.description}</div>
                    )}
                  </div>

                  <div className="dash-story-card__actions">
                    {/* Ver capítulos */}
                    <button
                      className="card-btn"
                      onClick={() => navigate(`/stories/${story.id}/chapters`)}
                      title="Ver capítulos"
                    >
                      <IconEye />
                    </button>

                    {/* Editar */}
                    <button
                      className="card-btn"
                      onClick={() => { setEditing(story); setModalOpen(true); }}
                      title="Editar"
                    >
                      <IconEdit />
                    </button>

                    {/* Publicar / Despublicar */}
                    <button
                      className={`card-btn card-btn--${story.published ? 'unpublish' : 'publish'}`}
                      onClick={() => handleTogglePublish(story.id)}
                      title={story.published ? 'Despublicar' : 'Publicar'}
                    >
                      {story.published ? 'Despublicar' : 'Publicar'}
                    </button>

                    {/* Excluir */}
                    {confirmDelete === story.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="card-btn card-btn--danger" onClick={() => handleDelete(story.id)}>Confirmar</button>
                        <button className="card-btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <button
                        className="card-btn card-btn--danger"
                        onClick={() => setConfirmDelete(story.id)}
                        title="Excluir"
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <StoryModal
          initial={editing ?? undefined}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}
