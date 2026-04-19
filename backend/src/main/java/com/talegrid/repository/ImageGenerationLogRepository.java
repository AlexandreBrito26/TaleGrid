package com.talegrid.repository;

import com.talegrid.model.ImageGenerationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface ImageGenerationLogRepository extends JpaRepository<ImageGenerationLog, UUID> {
    long countByGenerationDate(LocalDate date);
    long countByChapterId(UUID chapterId);
    long countByAuthorIdAndGenerationDate(UUID authorId, LocalDate date);
}
