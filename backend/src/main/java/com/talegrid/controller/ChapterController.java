package com.talegrid.controller;

import com.talegrid.dto.ChapterDto;
import com.talegrid.model.User;
import com.talegrid.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Endpoints de capítulos.
 *
 * Leitura (pública):
 *   GET /api/stories/{storyId}/chapters               — lista sumários
 *   GET /api/stories/{storyId}/chapters/{chapterId}   — conteúdo para leitura
 *   GET /api/stories/{storyId}/chapters/{id}/next     — navegar →
 *   GET /api/stories/{storyId}/chapters/{id}/previous — navegar ←
 *
 * Criação (autor autenticado):
 *   POST /api/stories/{storyId}/chapters              — upload PDF → cria capítulo
 */
@RestController
@RequestMapping("/api/stories/{storyId}/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    // ── Leitura pública ─────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<ChapterDto.ChapterSummary>> list(@PathVariable UUID storyId) {
        return ResponseEntity.ok(chapterService.listByStory(storyId));
    }

    @GetMapping("/{chapterId}")
    public ResponseEntity<ChapterDto.ChapterResponse> get(@PathVariable UUID storyId,
                                                           @PathVariable UUID chapterId) {
        return ResponseEntity.ok(chapterService.getForReading(storyId, chapterId));
    }

    @GetMapping("/{chapterId}/next")
    public ResponseEntity<ChapterDto.ChapterResponse> next(@PathVariable UUID storyId,
                                                            @PathVariable UUID chapterId) {
        return ResponseEntity.ok(chapterService.getRelative(storyId, chapterId, +1));
    }

    @GetMapping("/{chapterId}/previous")
    public ResponseEntity<ChapterDto.ChapterResponse> previous(@PathVariable UUID storyId,
                                                                @PathVariable UUID chapterId) {
        return ResponseEntity.ok(chapterService.getRelative(storyId, chapterId, -1));
    }

    // ── Upload (autor) ───────────────────────────────────────

    /**
     * Recebe um PDF e cria o capítulo com texto extraído.
     * O PDF é processado e descartado — nunca armazenado.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChapterDto.ChapterResponse> upload(
            @PathVariable UUID storyId,
            @RequestParam("title") String title,
            @RequestParam("file")  MultipartFile file,
            @AuthenticationPrincipal User author) throws IOException {

        ChapterDto.ChapterResponse response = chapterService.createFromPdf(storyId, title, file, author);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
