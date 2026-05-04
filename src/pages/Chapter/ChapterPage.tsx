import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterService } from '../../services/storyService';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import Spinner from '../../components/Spinner/Spinner';
import type { Chapter } from '../../types';
import './ChapterPage.scss';

export default function ChapterPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const navigate = useNavigate();
  const progress = useReadingProgress();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storyId || !chapterId) return;
    setLoading(true);
    window.scrollTo(0, 0);
    chapterService.get(storyId, chapterId)
      .then(setChapter)
      .catch(() => navigate(`/stories/${storyId}`))
      .finally(() => setLoading(false));
  }, [storyId, chapterId, navigate]);

  if (loading) return <div className="chapter-page__loading"><Spinner size="lg" /></div>;
  if (!chapter) return null;

  const paragraphs = chapter.content.trim().split(/\n+/);

  return (
    <main className="chapter-page">
      {/* Progress bar */}
      <div className="chapter-page__progress" style={{ width: `${progress}%` }} />

      <div className="chapter-page__inner">
        {/* Back */}
        <button className="chapter-page__back" onClick={() => navigate(`/stories/${storyId}`)}>
          ← Voltar para a história
        </button>

        {/* Header */}
        <header className="chapter-page__header">
          <span className="chapter-page__num">Capítulo {chapter.orderIndex}</span>
          <h1 className="chapter-page__title">{chapter.title}</h1>
          <div className="chapter-page__meta">
            {chapter.wordCount.toLocaleString('pt-BR')} palavras · {chapter.readingTimeMinutes} min de leitura
          </div>
        </header>

        {/* Content */}
        <article className="chapter-page__content">
          {paragraphs.map((p, i) => (
            p.startsWith('*') && p.endsWith('*')
              ? <p key={i} className="chapter-page__italic">{p.replace(/^\*|\*$/g, '')}</p>
              : <p key={i}>{p}</p>
          ))}
        </article>

        {/* Navigation */}
        <nav className="chapter-page__nav">
          <div>
            {chapter.hasPrevious && chapter.previousChapterId && (
              <button
                className="chapter-page__nav-btn chapter-page__nav-btn--prev"
                onClick={() => navigate(`/stories/${storyId}/chapters/${chapter.previousChapterId}`)}
              >
                ← Capítulo anterior
              </button>
            )}
          </div>
          <button className="chapter-page__nav-btn chapter-page__nav-btn--index" onClick={() => navigate(`/stories/${storyId}`)}>
            Índice
          </button>
          <div>
            {chapter.hasNext && chapter.nextChapterId && (
              <button
                className="chapter-page__nav-btn chapter-page__nav-btn--next"
                onClick={() => navigate(`/stories/${storyId}/chapters/${chapter.nextChapterId}`)}
              >
                Próximo capítulo →
              </button>
            )}
          </div>
        </nav>
      </div>
    </main>
  );
}
