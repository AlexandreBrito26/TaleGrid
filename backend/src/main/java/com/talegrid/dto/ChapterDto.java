package com.talegrid.dto;

import com.talegrid.model.Chapter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ChapterDto {

    /** Resposta completa de um capítulo (para leitura) */
    public record ChapterResponse(
        UUID   id,
        String title,
        int    orderIndex,
        int    wordCount,
        int    readingTimeMinutes,
        String content,        // texto puro — NUNCA um link de PDF
        List<String> aiImageUrls,
        boolean hasPrevious,
        boolean hasNext,
        LocalDateTime createdAt
    ) {
        public static ChapterResponse from(Chapter c, boolean includeContent) {
            return new ChapterResponse(
                c.getId(),
                c.getTitle(),
                c.getOrderIndex(),
                c.getWordCount()          != null ? c.getWordCount()          : 0,
                c.getReadingTimeMinutes() != null ? c.getReadingTimeMinutes() : 1,
                includeContent ? c.getContent() : null,
                c.getAiImageUrls(),
                c.getOrderIndex() > 1,
                true, // calculado dinamicamente no controller se necessário
                c.getCreatedAt()
            );
        }
    }

    /** Resumo leve para índice/sumário */
    public record ChapterSummary(
        UUID   id,
        String title,
        int    orderIndex,
        int    wordCount,
        int    readingTimeMinutes
    ) {
        public static ChapterSummary from(Chapter c) {
            return new ChapterSummary(
                c.getId(),
                c.getTitle(),
                c.getOrderIndex(),
                c.getWordCount()          != null ? c.getWordCount()          : 0,
                c.getReadingTimeMinutes() != null ? c.getReadingTimeMinutes() : 1
            );
        }
    }

    /** Body do upload de capítulo via PDF */
    public record UploadRequest(String title) {}
}
