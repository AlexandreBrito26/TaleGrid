import React, { useEffect, useState, useCallback } from 'react';
import { feedService } from '../../services/storyService';
import StoryCard from '../../components/StoryCard/StoryCard';
import Spinner from '../../components/Spinner/Spinner';
import type { StoryCard as StoryCardType } from '../../types';
import './FeedPage.scss';

const GENRES = ['Todos', 'RPG', 'Fantasia', 'Ficção Científica', 'Aventura', 'Terror', 'Romance', 'Mistério', 'Outro'];

export default function FeedPage() {
  const [stories, setStories] = useState<StoryCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Todos');
  const [query, setQuery] = useState('');

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedService.list({ q: query || undefined, genre: genre !== 'Todos' ? genre : undefined });
      setStories(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [query, genre]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <main className="feed">
      {/* Hero */}
      <section className="feed__hero">
        <div className="feed__hero-content">
          <p className="feed__hero-label">Plataforma de histórias</p>
          <h1 className="feed__hero-title">
            Mundos que esperam<br />
            <span className="feed__hero-accent">ser descobertos</span>
          </h1>
          <p className="feed__hero-sub">
            RPG, fantasia, ficção científica — histórias escritas por autores apaixonados,<br className="feed__br" />
            prontas para você explorar.
          </p>

          <form className="feed__search" onSubmit={handleSearch}>
            <input
              className="feed__search-input"
              type="text"
              placeholder="Buscar por título, autor ou gênero…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="feed__search-btn" type="submit">Buscar</button>
          </form>
        </div>

        <div className="feed__hero-deco" aria-hidden="true">
          <span className="feed__hero-rune">✦</span>
          <span className="feed__hero-rune feed__hero-rune--2">◎</span>
          <span className="feed__hero-rune feed__hero-rune--3">⚔</span>
        </div>
      </section>

      {/* Filtros de gênero */}
      <section className="feed__filters">
        <div className="feed__filters-inner">
          {GENRES.map((g) => (
            <button
              key={g}
              className={`feed__genre-btn ${genre === g ? 'feed__genre-btn--active' : ''}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de histórias */}
      <section className="feed__content">
        <div className="feed__content-inner">
          {query && (
            <p className="feed__results-info">
              {stories.length} resultado{stories.length !== 1 ? 's' : ''} para{' '}
              <strong>"{query}"</strong>
              {' '}
              <button className="feed__clear" onClick={() => { setQuery(''); setSearch(''); }}>
                Limpar
              </button>
            </p>
          )}

          {loading ? (
            <div className="feed__loading">
              <Spinner size="lg" />
            </div>
          ) : stories.length === 0 ? (
            <div className="feed__empty">
              <span className="feed__empty-icon">◇</span>
              <p>Nenhuma história encontrada.</p>
              <button className="feed__clear" onClick={() => { setQuery(''); setSearch(''); setGenre('Todos'); }}>
                Ver todas
              </button>
            </div>
          ) : (
            <div className="feed__grid">
              {stories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
