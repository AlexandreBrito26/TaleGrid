import api from './authService';

// ── Tipos ────────────────────────────────────────────────────

export interface ChapterSummary {
  id: string;
  title: string;
  orderIndex: number;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface ChapterResponse {
  id: string;
  title: string;
  orderIndex: number;
  wordCount: number;
  readingTimeMinutes: number;
  content: string;
  aiImageUrls: string[];
  hasPrevious: boolean;
  hasNext: boolean;
  createdAt: string;
}

export interface StoryResponse {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverImageUrl: string | null;
  published: boolean;
  authorName: string;
  chapterCount: number;
}

// ── Story API ─────────────────────────────────────────────────

export const storyService = {
  async listPublished(): Promise<StoryResponse[]> {
    const { data } = await api.get<StoryResponse[]>('/api/stories');
    return data;
  },

  async getById(id: string): Promise<StoryResponse> {
    const { data } = await api.get<StoryResponse>(`/api/stories/${id}`);
    return data;
  },
};

// ── Chapter API ───────────────────────────────────────────────

export const chapterService = {
  async list(storyId: string): Promise<ChapterSummary[]> {
    const { data } = await api.get<ChapterSummary[]>(`/api/stories/${storyId}/chapters`);
    return data;
  },

  async get(storyId: string, chapterId: string): Promise<ChapterResponse> {
    const { data } = await api.get<ChapterResponse>(
      `/api/stories/${storyId}/chapters/${chapterId}`
    );
    return data;
  },

  async getNext(storyId: string, chapterId: string): Promise<ChapterResponse> {
    const { data } = await api.get<ChapterResponse>(
      `/api/stories/${storyId}/chapters/${chapterId}/next`
    );
    return data;
  },

  async getPrevious(storyId: string, chapterId: string): Promise<ChapterResponse> {
    const { data } = await api.get<ChapterResponse>(
      `/api/stories/${storyId}/chapters/${chapterId}/previous`
    );
    return data;
  },

  /**
   * Upload de PDF — o back-end extrai o texto e descarta o arquivo.
   */
  async uploadPdf(storyId: string, title: string, file: File): Promise<ChapterResponse> {
    const form = new FormData();
    form.append('title', title);
    form.append('file', file);
    const { data } = await api.post<ChapterResponse>(
      `/api/stories/${storyId}/chapters`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },
};
