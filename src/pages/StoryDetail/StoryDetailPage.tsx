import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedService, chapterService } from '../../services/storyService';
import Spinner from '../../components/Spinner/Spinner';
import type { Story, ChapterSummary } from '../../types';
import './StoryDetailPage.scss';

const GENRE_ICONS: Record<string, string> = {
  RPG: '⚔', Fantasia: '✦', 'Ficção Científica': '◎', Aventura: '◆',
  Terror: '◈', Romance: '♡', Mistério: '◉', Outro: '◇',
};

export default function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storyId) return;
    Promise.all([feedService.getById(storyId), chapterService.list(storyId)])
      .then(([s, c]) => { setStory(s); setChapters(c); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [storyId, navigate]);

  if (loading) return <div className="story-detail__loading"><Spinner size="lg" /></div>;
  if (!story) return null;

  const icon = story.genre ? GENRE_ICONS[story.genre] ?? '◇' : '◇';
  const createdDate = new Date(story.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <main className="story-detail">
      <div className="story-detail__inner">
        {/* Header */}
        <header className="story-detail__header">
          <div className="story-detail__cover-placeholder">
            <span>{icon}</span>
          </div>
          <div className="story-detail__meta">
            {story.genre && <span className="story-detail__genre">{story.genre}</span>}
            <h1 className="story-detail__title">{story.title}</h1>
            <p className="story-detail__author">por <strong>{story.authorName}</strong></p>
            <div className="story-detail__stats">
              <span>{story.chapterCount} capítulo{story.chapterCount !== 1 ? 's' : ''}</span>
              <span className="story-detail__dot">·</span>
              <span>{story.viewCount.toLocaleString('pt-BR')} leituras</span>
              <span className="story-detail__dot">·</span>
              <span>Desde {createdDate}</span>
            </div>
            {story.description && <p className="story-detail__desc">{story.description}</p>}
            {chapters.length > 0 && (
              <button
                className="story-detail__start-btn"
                onClick={() => navigate(`/stories/${storyId}/chapters/${chapters[0].id}`)}
              >
                Começar a ler →
              </button>
            )}
          </div>
        </header>

        {/* Chapters list */}
        <section className="story-detail__chapters">
          <h2 className="story-detail__chapters-title">Capítulos</h2>
          {chapters.length === 0 ? (
            <p className="story-detail__no-chapters">Nenhum capítulo publicado ainda.</p>
          ) : (
            <ol className="story-detail__chapter-list">
              {chapters.map((ch) => (
                <li key={ch.id} className="story-detail__chapter-item"
                  onClick={() => navigate(`/stories/${storyId}/chapters/${ch.id}`)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/stories/${storyId}/chapters/${ch.id}`)}
                >
                  <span className="story-detail__chapter-num">{ch.orderIndex}</span>
                  <div className="story-detail__chapter-info">
                    <span className="story-detail__chapter-name">{ch.title}</span>
                    <span className="story-detail__chapter-meta">
                      {ch.wordCount.toLocaleString('pt-BR')} palavras · {ch.readingTimeMinutes} min
                    </span>
                  </div>
                  <span className="story-detail__chapter-arrow">→</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
