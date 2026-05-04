import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorChapterService } from '../../services/storyService';
import Spinner from '../../components/Spinner/Spinner';
import './ChapterEditorPage.scss';

export default function ChapterEditorPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(chapterId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!storyId || !chapterId) return;
    authorChapterService.list(storyId).then((chapters) => {
      const ch = chapters.find((c) => c.id === chapterId);
      if (ch) { setTitle(ch.title); }
    });
    // get full chapter with content
    import('../../services/storyService').then(({ chapterService }) => {
      chapterService.get(storyId, chapterId!).then((ch) => {
        setTitle(ch.title);
        setContent(ch.content);
        setWordCount(ch.wordCount);
      }).catch(() => {}).finally(() => setLoading(false));
    });
  }, [storyId, chapterId]);

  useEffect(() => {
    const count = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(count);
  }, [content]);

  const save = async (publish?: boolean) => {
    if (!title.trim()) { setError('Título é obrigatório.'); return; }
    setError('');
    if (publish) setPublishing(true); else setSaving(true);
    try {
      const payload = { title: title.trim(), content, ...(publish !== undefined ? { published: publish } : {}) };
      if (isEdit && storyId && chapterId) {
        await authorChapterService.update(storyId, chapterId, payload);
      } else if (storyId) {
        const created = await authorChapterService.create(storyId, payload);
        if (publish) await authorChapterService.update(storyId, created.id, { published: true });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  if (loading) return <div className="chapter-editor__loading"><Spinner size="lg" /></div>;

  return (
    <main className="chapter-editor">
      <div className="chapter-editor__bar">
        <button className="chapter-editor__back" onClick={() => navigate('/dashboard')}>
          ← Painel
        </button>
        <div className="chapter-editor__bar-right">
          <span className="chapter-editor__word-count">
            {wordCount.toLocaleString('pt-BR')} palavras
          </span>
          <button className="chapter-editor__save-btn" onClick={() => save()} disabled={saving || publishing}>
            {saving ? <Spinner size="sm" /> : 'Salvar rascunho'}
          </button>
          <button className="chapter-editor__publish-btn" onClick={() => save(true)} disabled={saving || publishing}>
            {publishing ? <Spinner size="sm" /> : 'Salvar e publicar'}
          </button>
        </div>
      </div>

      <div className="chapter-editor__inner">
        {error && <div className="chapter-editor__error">{error}</div>}

        <input
          className="chapter-editor__title-input"
          type="text"
          placeholder="Título do capítulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="chapter-editor__content-input"
          placeholder="Escreva seu capítulo aqui…

Dica: separe parágrafos com linhas em branco.
Use *texto* para itálico/citações."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </main>
  );
}
