package com.talegrid.service;

import com.talegrid.dto.StoryDto;
import com.talegrid.model.Story;
import com.talegrid.model.User;
import com.talegrid.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;

    // ── Feed público ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StoryDto.StoryCard> listPublished(String search) {
        List<Story> stories = (search != null && !search.isBlank())
            ? storyRepository.searchPublished(search.trim())
            : storyRepository.findByPublishedTrueOrderByCreatedAtDesc();

        return stories.stream().map(StoryDto.StoryCard::from).toList();
    }

    @Transactional(readOnly = true)
    public StoryDto.StoryResponse getById(UUID id) {
        return StoryDto.StoryResponse.from(findOrThrow(id));
    }

    // ── Painel do autor ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StoryDto.StoryResponse> listByAuthor(User author) {
        return storyRepository.findByAuthorIdOrderByUpdatedAtDesc(author.getId())
            .stream().map(StoryDto.StoryResponse::from).toList();
    }

    @Transactional
    public StoryDto.StoryResponse create(StoryDto.CreateRequest req, User author) {
        Story story = new Story();
        story.setTitle(req.title());
        story.setDescription(req.description());
        story.setGenre(req.genre());
        story.setAuthor(author);
        story.setPublished(false);
        return StoryDto.StoryResponse.from(storyRepository.save(story));
    }

    @Transactional
    public StoryDto.StoryResponse update(UUID id, StoryDto.CreateRequest req, User author) {
        Story story = getOwnedBy(id, author);
        story.setTitle(req.title());
        story.setDescription(req.description());
        story.setGenre(req.genre());
        return StoryDto.StoryResponse.from(storyRepository.save(story));
    }

    /** Alterna o status publicado/rascunho */
    @Transactional
    public StoryDto.StoryResponse togglePublish(UUID id, User author) {
        Story story = getOwnedBy(id, author);
        story.setPublished(!story.isPublished());
        return StoryDto.StoryResponse.from(storyRepository.save(story));
    }

    @Transactional
    public void delete(UUID id, User author) {
        Story story = getOwnedBy(id, author);
        storyRepository.delete(story);
    }

    // ── Privados ─────────────────────────────────────────────

    private Story findOrThrow(UUID id) {
        return storyRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                "História não encontrada."));
    }

    private Story getOwnedBy(UUID id, User author) {
        Story story = findOrThrow(id);
        if (!story.getAuthor().getId().equals(author.getId()))
            throw new AccessDeniedException("Você não é o autor desta história.");
        return story;
    }
}
