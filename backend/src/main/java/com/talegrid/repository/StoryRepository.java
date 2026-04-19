package com.talegrid.repository;

import com.talegrid.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StoryRepository extends JpaRepository<Story, UUID> {

    // Feed público — apenas histórias publicadas
    List<Story> findByPublishedTrueOrderByCreatedAtDesc();

    // Painel do autor
    List<Story> findByAuthorIdOrderByUpdatedAtDesc(UUID authorId);

    // Busca por título (feed)
    @Query("SELECT s FROM Story s WHERE s.published = true AND LOWER(s.title) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Story> searchPublished(String q);
}
