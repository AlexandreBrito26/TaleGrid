import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { StoryCard as StoryCardType } from '../../types';
import './StoryCard.scss';

const GENRE_ICONS: Record<string, string> = {
  RPG: '⚔',
  Fantasia: '✦',
  'Ficção Científica': '◎',
  Aventura: '◆',
  Terror: '◈',
  Romance: '♡',
  Mistério: '◉',
  Outro: '◇',
};

interface Props {
  story: StoryCardType;
}

export default function StoryCard({ story }: Props) {
  const navigate = useNavigate();
  const icon = story.genre ? GENRE_ICONS[story.genre] ?? '◇' : '◇';
  const date = new Date(story.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <article
      className="story-card"
      onClick={() => navigate(`/stories/${story.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/stories/${story.id}`)}
      aria-label={`Ler ${story.title}`}
    >
      <div className={`story-card__cover ${!story.coverImageUrl ? 'story-card__cover--placeholder' : ''}`}>
        {story.coverImageUrl
          ? <img src={story.coverImageUrl} alt={story.title} loading="lazy" />
          : <span className="story-card__icon">{icon}</span>
        }
        {story.genre && <span className="story-card__genre">{story.genre}</span>}
      </div>

      <div className="story-card__body">
        <h2 className="story-card__title">{story.title}</h2>
        <p className="story-card__author">por {story.authorName}</p>
        {story.description && (
          <p className="story-card__desc">{story.description}</p>
        )}
        <div className="story-card__footer">
          <span>
            {story.chapterCount} capítulo{story.chapterCount !== 1 ? 's' : ''} · {date}
          </span>
          <span className="story-card__read-btn">Ler →</span>
        </div>
      </div>
    </article>
  );
}
