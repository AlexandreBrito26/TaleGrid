import api from './authService';

export interface QuotaInfo {
  usedToday: number;
  dailyLimit: number;
  remaining: number;
  usedByAuthorToday: number;
  maxPerChapter: number;
}

export interface GenerateImageResponse {
  imageUrl: string;
  imagesInChapter: number;
  maxImages: number;
  limitReached: boolean;
}

export const aiService = {
  async generateImage(storyId: string, chapterId: string, prompt: string): Promise<GenerateImageResponse> {
    const { data } = await api.post<GenerateImageResponse>(
      `/api/stories/${storyId}/chapters/${chapterId}/images`,
      { prompt }
    );
    return data;
  },

  async getQuota(): Promise<QuotaInfo> {
    const { data } = await api.get<QuotaInfo>('/api/ai/quota');
    return data;
  },
};
