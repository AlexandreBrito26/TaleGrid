package com.talegrid.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Capítulo de uma história.
 *
 * IMPORTANTE DE SEGURANÇA:
 * - O campo `content` armazena APENAS o texto puro extraído do PDF.
 * - O arquivo PDF original nunca é persistido no banco nem no disco.
 * - O front-end recebe apenas `content` (texto), jamais um link de download.
 */
@Entity
@Table(name = "chapters")
@Data
@NoArgsConstructor
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    /**
     * Texto puro extraído do PDF via Apache PDFBox.
     * Sanitizado e formatado antes de ser persistido.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "reading_time_minutes")
    private Integer readingTimeMinutes; // estimativa: wordCount / 200

    /**
     * URLs das imagens geradas pela IA (Gemini) para este capítulo.
     * Máximo 3 por capítulo — controlado no ChapterService.
     */
    @ElementCollection
    @CollectionTable(name = "chapter_images", joinColumns = @JoinColumn(name = "chapter_id"))
    @Column(name = "image_url")
    @OrderColumn(name = "position")
    private List<String> aiImageUrls = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
