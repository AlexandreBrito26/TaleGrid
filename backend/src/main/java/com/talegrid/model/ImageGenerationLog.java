package com.talegrid.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "image_generation_logs",
    indexes = {
        @Index(name = "idx_log_date",        columnList = "generation_date"),
        @Index(name = "idx_log_chapter",     columnList = "chapter_id"),
        @Index(name = "idx_log_author_date", columnList = "author_id, generation_date"),
    })
@Data
@NoArgsConstructor
public class ImageGenerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "prompt_used", columnDefinition = "TEXT")
    private String promptUsed;

    @Column(name = "generation_date", nullable = false)
    private LocalDate generationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (generationDate == null) generationDate = LocalDate.now();
    }
}
