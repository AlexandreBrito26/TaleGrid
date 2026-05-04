import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorStoryService } from '../../services/storyService';
import Spinner from '../../components/Spinner/Spinner';
import type { Genre } from '../../types';
import './StoryEditorPage.scss';

const GENRES: Genre[] = ['RPG', 'Fantasia', 'Ficção Científica', 'Aventura', 'Terror', 'Romance', 'Mistério', 'Outro'];

export default function StoryEditorPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(storyId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<Genre>('Fantasia');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!storyId) return;
    authorStoryService.list().then((stories) => {
      const s = stories.find((x) => x.id === storyId);
      if (s) { setTitle(s.title); setDescription(s.description || ''); setGenre(s.genre as Genre); }
    }).finally(() => setLoading(false));
  }, [storyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Título é obrigatório.'); return; }
    setError(''); setSaving(true);
    try {
      if (isEdit && storyId) {
        await authorStoryService.update(storyId, { title: title.trim(), description: description.trim(), genre });
      } else {
        await authorStoryService.create({ title: title.trim(), description: description.trim(), genre });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="story-editor__loading"><Spinner size="lg" /></div>;

  return (
    <main className="story-editor">
      <div className="story-editor__inner">
        <button className="story-editor__back" onClick={() => navigate('/dashboard')}>
          ← Voltar ao painel
        </button>

        <h1 className="story-editor__title">{isEdit ? 'Editar história' : 'Nova história'}</h1>

        {error && <div className="story-editor__error">{error}</div>}

        <form className="story-editor__form" onSubmit={handleSubmit} noValidate>
          <div className="story-editor__field">
            <label htmlFor="title">Título *</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="O nome da sua história" />
          </div>

          <div className="story-editor__field">
            <label htmlFor="genre">Gênero</label>
            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="story-editor__field">
            <label htmlFor="description">Sinopse</label>
            <textarea id="description" rows={5} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição da sua história…" />
          </div>

          <div className="story-editor__actions">
            <button type="button" className="story-editor__cancel" onClick={() => navigate('/dashboard')}>
              Cancelar
            </button>
            <button type="submit" className="story-editor__submit" disabled={saving}>
              {saving ? <Spinner size="sm" /> : isEdit ? 'Salvar alterações' : 'Criar história'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
