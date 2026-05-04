import { api } from './api';
import type {
  Story,
  StoryCard,
  CreateStoryPayload,
  UpdateStoryPayload,
  Chapter,
  ChapterSummary,
  CreateChapterPayload,
  UpdateChapterPayload,
} from '../types';

// ── Feed (público) ───────────────────────────────────────────
export const feedService = {
  async list(params?: { q?: string; genre?: string }): Promise<StoryCard[]> {
    const { data } = await api.get<StoryCard[]>('/stories', { params });
    return data;
  },

  async getById(id: string): Promise<Story> {
    const { data } = await api.get<Story>(`/stories/${id}`);
    return data;
  },
};

// ── Capítulos (público) ──────────────────────────────────────
export const chapterService = {
  async list(storyId: string): Promise<ChapterSummary[]> {
    const { data } = await api.get<ChapterSummary[]>(`/stories/${storyId}/chapters`);
    return data;
  },

  async get(storyId: string, chapterId: string): Promise<Chapter> {
    const { data } = await api.get<Chapter>(`/stories/${storyId}/chapters/${chapterId}`);
    return data;
  },
};

// ── Autor — histórias ────────────────────────────────────────
export const authorStoryService = {
  async list(): Promise<Story[]> {
    const { data } = await api.get<Story[]>('/author/stories');
    return data;
  },

  async create(payload: CreateStoryPayload): Promise<Story> {
    const { data } = await api.post<Story>('/author/stories', payload);
    return data;
  },

  async update(id: string, payload: UpdateStoryPayload): Promise<Story> {
    const { data } = await api.patch<Story>(`/author/stories/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/author/stories/${id}`);
  },

  async togglePublish(id: string): Promise<Story> {
    const { data } = await api.post<Story>(`/author/stories/${id}/publish`);
    return data;
  },
};

// ── Autor — capítulos ────────────────────────────────────────
export const authorChapterService = {
  async list(storyId: string): Promise<ChapterSummary[]> {
    const { data } = await api.get<ChapterSummary[]>(`/author/stories/${storyId}/chapters`);
    return data;
  },

  async create(storyId: string, payload: CreateChapterPayload): Promise<Chapter> {
    const { data } = await api.post<Chapter>(`/author/stories/${storyId}/chapters`, payload);
    return data;
  },

  async update(storyId: string, chapterId: string, payload: UpdateChapterPayload): Promise<Chapter> {
    const { data } = await api.patch<Chapter>(
      `/author/stories/${storyId}/chapters/${chapterId}`,
      payload
    );
    return data;
  },

  async delete(storyId: string, chapterId: string): Promise<void> {
    await api.delete(`/author/stories/${storyId}/chapters/${chapterId}`);
  },
};
