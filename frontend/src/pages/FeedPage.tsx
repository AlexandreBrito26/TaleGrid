import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedService, StoryCard } from '../services/storyService';
import { authService } from '../services/authService';
import './FeedPage.scss';

const GENRES = ['Todos', 'RPG', 'Fantasia', 'Ficção Científica', 'Aventura', 'Terror', 'Romance', 'Mistério'];

// ── Ícones de gênero ──────────────────────────────────────────
const GENRE_ICONS: Record<string, string> = {
  RPG: '⚔', Fantasia: '✦', 'Ficção Científica': '◎', Aventura: '◆',
  Terror: '◈', Romance: '♡', Mistério: '◉', Outro: '◇',
};

// ── Skeleton ──────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="feed-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="sk-card">
          <div className="sk-cover" />
          <div className="sk-body">
            <div className="sk-line" />
            <div className="sk-line" />
            <div className="sk-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Card de história ──────────────────────────────────────────
function StoryCardUI({ story, onClick }: { story: StoryCard; onClick: () => void }) {
  const icon = story.genre ? GENRE_ICONS[story.genre] ?? '◇' : '◇';
  const updatedDate = new Date(story.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <article className="feed-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>

      <div className={`feed-card__cover ${!story.coverImageUrl ? 'feed-card__cover--placeholder' : ''}`}>
        {story.coverImageUrl
          ? <img src={story.coverImageUrl} alt={story.title} loading="lazy" />
          : icon}
        {story.genre && <span className="feed-card__genre">{story.genre}</span>}
      </div>

      <div className="feed-card__body">
        <h2 className="feed-card__title">{story.title}</h2>
        <p className="feed-card__author">por {story.authorName}</p>
        {story.description && (
          <p className="feed-card__desc">{story.description}</p>
        )}
        <div className="feed-card__footer">
          <span>{story.chapterCount} capítulo{story.chapterCount !== 1 ? 's' : ''} · {updatedDate}</span>
          <span className="feed-card__read-btn">Ler →</span>
        </div>
      </div>
    </article>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function FeedPage() {
  const navigate = useNavigate();
  const isAuth   = authService.isAuthenticated();

  const [allStories, setAllStories] = useState<StoryCard[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [genre, setGenre]           = useState('Todos');
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const data = await feedService.list(q);
      setAllStories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  function handleClearSearch() {
    setSearch('');
    load();
  }

  // Filtra por gênero no cliente (busca por texto vai ao servidor)
  const displayed = genre === 'Todos'
    ? allStories
    : allStories.filter(s => s.genre === genre);

  function openStory(story: StoryCard) {
    navigate(`/stories/${story.id}`);
  }

  return (
    <div className="feed-page">

      {/* Navbar */}
      <nav className="feed-nav">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="mark">T</span>
          TaleGrid
        </div>
        <div className="nav-actions">
          {isAuth ? (
            <button className="nav-link" onClick={() => navigate('/dashboard')}>
              Painel do autor
            </button>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate('/login')}>Entrar</button>
              <button className="nav-link nav-link--cta" onClick={() => navigate('/login')}>
                Publicar
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="feed-header">
        <p className="feed-header__eyebrow">✦ Comunidade TaleGrid ✦</p>
        <h1>Histórias que<br /><em>merecem ser lidas</em></h1>
        <p className="feed-header__sub">
          RPG, fantasia e aventura — obras originais de autores independentes, protegidas e compartilhadas com você.
        </p>

        {/* Busca */}
        <form className="feed-search" onSubmit={handleSearch}>
          <input
            ref={searchRef}
            type="search"
            placeholder="Buscar por título ou autor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">Buscar</button>
          {search && (
            <button type="button" onClick={handleClearSearch}
              style={{ background: 'transparent', color: '#5a5248', border: '1px solid rgba(201,153,74,.18)', borderRadius: 8, padding: '11px 12px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem' }}>
              ✕
            </button>
          )}
        </form>
      </header>

      {/* Filtros de gênero */}
      <div className="genre-filter">
        {GENRES.map(g => (
          <button
            key={g}
            className={genre === g ? 'active' : ''}
            onClick={() => setGenre(g)}
          >
            {g !== 'Todos' && GENRE_ICONS[g] ? `${GENRE_ICONS[g]} ` : ''}{g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="feed-grid-wrap">
        {loading ? (
          <FeedSkeleton />
        ) : displayed.length === 0 ? (
          <div className="feed-empty">
            {search
              ? `Nenhuma história encontrada para "${search}".`
              : 'Nenhuma história publicada ainda. Seja o primeiro!'}
          </div>
        ) : (
          <div className="feed-grid">
            {displayed.map(story => (
              <StoryCardUI key={story.id} story={story} onClick={() => openStory(story)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
