package com.talegrid.repository;

import com.talegrid.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, UUID> {

    List<Chapter> findByStoryIdOrderByOrderIndexAsc(UUID storyId);

    Optional<Chapter> findByStoryIdAndOrderIndex(UUID storyId, int orderIndex);

    long countByStoryId(UUID storyId);
}
