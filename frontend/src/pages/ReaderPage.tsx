import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chapterService, ChapterResponse, ChapterSummary } from '../services/storyService';
import { useReadingProgress } from '../hooks/useReadingProgress';
import './ReaderPage.scss';

// ── Tipos ────────────────────────────────────────────────────

type Theme    = 'dark' | 'light' | 'sepia';
type FontSize = 'sm' | 'md' | 'lg';

// ── Ícones inline (SVG) ──────────────────────────────────────

const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconWords = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

// ── Utilitários ───────────────────────────────────────────────

/**
 * Converte texto puro (do back-end) em parágrafos React.
 * Sanitiza: remove HTML, divide em parágrafos por linha dupla.
 */
function renderContent(raw: string): React.ReactNode[] {
  return raw
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map((paragraph, i) => (
      <p key={i}>{paragraph.replace(/\n/g, ' ')}</p>
    ));
}

// ── Skeleton de loading ───────────────────────────────────────

function ReaderSkeleton() {
  return (
    <div className="reader-skeleton">
      <div className="reader-skeleton__title" />
      <div className="reader-skeleton__meta" />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="reader-skeleton__line" />
      ))}
    </div>
  );
}

// ── Painel de configurações ───────────────────────────────────

interface SettingsPanelProps {
  theme: Theme;
  fontSize: FontSize;
  onTheme: (t: Theme) => void;
  onFontSize: (s: FontSize) => void;
}

function SettingsPanel({ theme, fontSize, onTheme, onFontSize }: SettingsPanelProps) {
  return (
    <div className="reader-settings">
      <h3>Aparência</h3>

      <div className="reader-settings__row">
        <span>Tema</span>
        <div className="reader-settings__themes">
          {(['dark', 'light', 'sepia'] as Theme[]).map(t => (
            <button
              key={t}
              aria-label={`Tema ${t}`}
              className={`reader-settings__theme-dot reader-settings__theme-dot--${t} ${theme === t ? 'active' : ''}`}
              onClick={() => onTheme(t)}
            />
          ))}
        </div>
      </div>

      <div className="reader-settings__row">
        <span>Fonte</span>
        <div className="reader-settings__font-size">
          {(['sm', 'md', 'lg'] as FontSize[]).map(s => (
            <button
              key={s}
              className={fontSize === s ? 'active' : ''}
              onClick={() => onFontSize(s)}
            >
              {s === 'sm' ? 'A' : s === 'md' ? 'A' : 'A'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Índice de capítulos ───────────────────────────────────────

interface ChapterIndexProps {
  chapters: ChapterSummary[];
  currentId: string;
  storyId: string;
  onSelect: (id: string) => void;
}

function ChapterIndex({ chapters, currentId, storyId, onSelect }: ChapterIndexProps) {
  return (
    <div className="reader-settings" style={{ width: 280 }}>
      <h3>Capítulos</h3>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {chapters.map(ch => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 10px',
              borderRadius: 6,
              background: ch.id === currentId ? 'var(--bg-elevated, #1f1929)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 2,
              color: ch.id === currentId ? '#c9994a' : '#9c9080',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ opacity: 0.5, marginRight: 8 }}>{ch.orderIndex}.</span>
            {ch.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────

export default function ReaderPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const navigate = useNavigate();

  const [chapter, setChapter]     = useState<ChapterResponse | null>(null);
  const [chapters, setChapters]   = useState<ChapterSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [theme, setTheme]         = useState<Theme>('dark');
  const [fontSize, setFontSize]   = useState<FontSize>('md');
  const [showSettings, setShowSettings] = useState(false);
  const [showIndex, setShowIndex]       = useState(false);

  const progress = useReadingProgress();

  // Fecha painéis ao clicar fora
  const settingsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
        setShowIndex(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadChapter = useCallback(async (sId: string, cId: string) => {
    setLoading(true);
    setError('');
    try {
      const [chapterData, chaptersData] = await Promise.all([
        chapterService.get(sId, cId),
        chapterService.list(sId),
      ]);
      setChapter(chapterData);
      setChapters(chaptersData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Não foi possível carregar este capítulo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (storyId && chapterId) loadChapter(storyId, chapterId);
  }, [storyId, chapterId, loadChapter]);

  // Aplica tema e tamanho de fonte no body
  useEffect(() => {
    document.body.className = `font-${fontSize}`;
  }, [fontSize]);

  function navigateTo(id: string) {
    navigate(`/stories/${storyId}/chapters/${id}`);
    setShowIndex(false);
  }

  function goNext() {
    if (chapter?.hasNext) navigate(`/stories/${storyId}/chapters/${chapter.id}/next`);
  }

  function goPrev() {
    if (chapter?.hasPrevious) navigate(`/stories/${storyId}/chapters/${chapter.id}/previous`);
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className={`reader-page theme-${theme}`}>
      {/* Barra de progresso */}
      <div
        className="reading-progress"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de leitura"
      />

      {/* Navbar */}
      <nav className="reader-nav">
        <a href="#back" className="reader-nav__back" onClick={e => { e.preventDefault(); navigate(-1); }}>
          <IconBack /> Voltar
        </a>

        <div className="reader-nav__meta">
          {chapter && (
            <>
              <div className="story-title">História</div>
              <div className="chapter-title">{chapter.title}</div>
            </>
          )}
        </div>

        <div className="reader-nav__actions" ref={settingsRef}>
          {/* Índice */}
          <button
            className={`reader-nav__btn ${showIndex ? 'active' : ''}`}
            aria-label="Índice de capítulos"
            onClick={() => { setShowIndex(v => !v); setShowSettings(false); }}
          >
            <IconList />
          </button>

          {/* Configurações */}
          <button
            className={`reader-nav__btn ${showSettings ? 'active' : ''}`}
            aria-label="Configurações de leitura"
            onClick={() => { setShowSettings(v => !v); setShowIndex(false); }}
          >
            <IconSettings />
          </button>

          {/* Painéis flutuantes */}
          {showSettings && (
            <SettingsPanel
              theme={theme}
              fontSize={fontSize}
              onTheme={t => { setTheme(t); setShowSettings(false); }}
              onFontSize={setFontSize}
            />
          )}
          {showIndex && chapters.length > 0 && chapter && (
            <ChapterIndex
              chapters={chapters}
              currentId={chapter.id}
              storyId={storyId!}
              onSelect={navigateTo}
            />
          )}
        </div>
      </nav>

      {/* Corpo */}
      <div className="reader-body">
        <article className="reader-content">

          {loading && <ReaderSkeleton />}

          {error && (
            <div style={{ color: '#e06060', fontFamily: "'DM Sans', sans-serif", padding: '40px 0', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {!loading && !error && chapter && (
            <>
              {/* Cabeçalho do capítulo */}
              <header className="chapter-header">
                <div className="chapter-header__number">
                  Capítulo {chapter.orderIndex}
                </div>
                <h1 className="chapter-header__title">{chapter.title}</h1>
                <div className="chapter-header__meta">
                  <span><IconClock /> {chapter.readingTimeMinutes} min de leitura</span>
                  <span><IconWords /> {chapter.wordCount.toLocaleString('pt-BR')} palavras</span>
                </div>
              </header>

              {/* Imagem de IA — hero (primeira imagem, se houver) */}
              {chapter.aiImageUrls[0] && (
                <div className="chapter-ai-image">
                  <img
                    src={chapter.aiImageUrls[0]}
                    alt={`Ilustração do capítulo ${chapter.orderIndex}`}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Texto do capítulo */}
              <div className="chapter-text">
                {renderContent(chapter.content)}

                {/* Imagem de IA no meio do texto (segunda imagem) */}
                {chapter.aiImageUrls[1] && (
                  <figure className="inline-ai-image">
                    <img
                      src={chapter.aiImageUrls[1]}
                      alt="Ilustração"
                      loading="lazy"
                    />
                    <figcaption>Imagem gerada por IA para este capítulo</figcaption>
                  </figure>
                )}
              </div>

              {/* Divisor ornamental */}
              <div className="chapter-divider">
                <span>✦ ✦ ✦</span>
              </div>

              {/* Navegação entre capítulos */}
              <nav className="chapter-navigation" aria-label="Navegação entre capítulos">
                <button
                  className="nav-chapter-btn"
                  disabled={!chapter.hasPrevious}
                  onClick={goPrev}
                >
                  <span className="nav-label">← Anterior</span>
                  <span className="nav-title">
                    {chapter.hasPrevious ? 'Capítulo anterior' : 'Primeiro capítulo'}
                  </span>
                </button>

                <button
                  className="nav-chapter-btn nav-chapter-btn--next"
                  disabled={!chapter.hasNext}
                  onClick={goNext}
                >
                  <span className="nav-label">Próximo →</span>
                  <span className="nav-title">
                    {chapter.hasNext ? 'Próximo capítulo' : 'Último capítulo'}
                  </span>
                </button>
              </nav>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
