// ============================================================
// TaleGrid — Tipos compartilhados
// ============================================================

// ── Auth ─────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'AUTHOR' | 'READER';
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── Stories ──────────────────────────────────────────────────

export type Genre =
  | 'RPG'
  | 'Fantasia'
  | 'Ficção Científica'
  | 'Aventura'
  | 'Terror'
  | 'Romance'
  | 'Mistério'
  | 'Outro';

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: Genre;
  coverImageUrl: string | null;
  published: boolean;
  authorId: string;
  authorName: string;
  chapterCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Feed card (subset público) */
export type StoryCard = Pick<
  Story,
  | 'id'
  | 'title'
  | 'description'
  | 'genre'
  | 'coverImageUrl'
  | 'authorName'
  | 'chapterCount'
  | 'viewCount'
  | 'updatedAt'
>;

export interface CreateStoryPayload {
  title: string;
  description: string;
  genre: Genre;
}

export interface UpdateStoryPayload extends Partial<CreateStoryPayload> {}

// ── Chapters ─────────────────────────────────────────────────

export interface ChapterSummary {
  id: string;
  storyId: string;
  title: string;
  orderIndex: number;
  wordCount: number;
  readingTimeMinutes: number;
  published: boolean;
  createdAt: string;
}

export interface Chapter extends ChapterSummary {
  content: string;
  aiImageUrls: string[];
  hasPrevious: boolean;
  hasNext: boolean;
  previousChapterId: string | null;
  nextChapterId: string | null;
}

export interface CreateChapterPayload {
  title: string;
  content: string;
}

export interface UpdateChapterPayload extends Partial<CreateChapterPayload> {
  published?: boolean;
}

// ── AI ───────────────────────────────────────────────────────

export interface QuotaInfo {
  usedToday: number;
  dailyLimit: number;
  remaining: number;
  maxPerChapter: number;
}

export interface GenerateImageResponse {
  imageUrl: string;
  imagesInChapter: number;
  maxImages: number;
  limitReached: boolean;
}

// ── API wrappers ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ── UI state ─────────────────────────────────────────────────

export type Theme = 'dark' | 'light' | 'sepia';
export type FontSize = 'sm' | 'md' | 'lg';

export interface ReaderPreferences {
  theme: Theme;
  fontSize: FontSize;
}
