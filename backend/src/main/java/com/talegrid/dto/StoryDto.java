package com.talegrid.dto;

import com.talegrid.model.Story;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class StoryDto {

    /** Body do POST /api/stories (criar história) */
    public record CreateRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(max = 200)
        String title,

        @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
        String description,

        @Size(max = 100)
        String genre
    ) {}

    /** Resposta completa de uma história (painel do autor) */
    public record StoryResponse(
        UUID   id,
        String title,
        String description,
        String genre,
        String coverImageUrl,
        boolean published,
        String  authorName,
        UUID    authorId,
        int     chapterCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static StoryResponse from(Story s) {
            return new StoryResponse(
                s.getId(),
                s.getTitle(),
                s.getDescription(),
                s.getGenre(),
                s.getCoverImageUrl(),
                s.isPublished(),
                s.getAuthor().getName(),
                s.getAuthor().getId(),
                s.getChapters().size(),
                s.getCreatedAt(),
                s.getUpdatedAt()
            );
        }
    }

    /** Card resumido para o feed público */
    public record StoryCard(
        UUID   id,
        String title,
        String description,
        String genre,
        String coverImageUrl,
        String authorName,
        int    chapterCount,
        LocalDateTime updatedAt
    ) {
        public static StoryCard from(Story s) {
            return new StoryCard(
                s.getId(),
                s.getTitle(),
                s.getDescription() != null && s.getDescription().length() > 160
                    ? s.getDescription().substring(0, 160) + "…"
                    : s.getDescription(),
                s.getGenre(),
                s.getCoverImageUrl(),
                s.getAuthor().getName(),
                s.getChapters().size(),
                s.getUpdatedAt()
            );
        }
    }
}
