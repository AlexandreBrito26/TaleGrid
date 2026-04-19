package com.talegrid.controller;

import com.talegrid.dto.StoryDto;
import com.talegrid.model.User;
import com.talegrid.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Feed público (sem auth):
 *   GET /api/stories             — lista publicadas (aceita ?q= para busca)
 *   GET /api/stories/{id}        — detalhe de uma história
 *
 * Painel do autor (auth obrigatória):
 *   GET    /api/author/stories          — minhas histórias
 *   POST   /api/author/stories          — criar
 *   PUT    /api/author/stories/{id}     — editar
 *   PATCH  /api/author/stories/{id}/publish — publicar/despublicar
 *   DELETE /api/author/stories/{id}     — excluir
 */
@RestController
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    // ── Feed público ─────────────────────────────────────────

    @GetMapping("/api/stories")
    public ResponseEntity<List<StoryDto.StoryCard>> feed(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(storyService.listPublished(q));
    }

    @GetMapping("/api/stories/{id}")
    public ResponseEntity<StoryDto.StoryResponse> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(storyService.getById(id));
    }

    // ── Painel do autor ──────────────────────────────────────

    @GetMapping("/api/author/stories")
    public ResponseEntity<List<StoryDto.StoryResponse>> mine(
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(storyService.listByAuthor(author));
    }

    @PostMapping("/api/author/stories")
    public ResponseEntity<StoryDto.StoryResponse> create(
            @Valid @RequestBody StoryDto.CreateRequest req,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(storyService.create(req, author));
    }

    @PutMapping("/api/author/stories/{id}")
    public ResponseEntity<StoryDto.StoryResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody StoryDto.CreateRequest req,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(storyService.update(id, req, author));
    }

    @PatchMapping("/api/author/stories/{id}/publish")
    public ResponseEntity<StoryDto.StoryResponse> togglePublish(
            @PathVariable UUID id,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(storyService.togglePublish(id, author));
    }

    @DeleteMapping("/api/author/stories/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User author) {
        storyService.delete(id, author);
        return ResponseEntity.noContent().build();
    }
}
