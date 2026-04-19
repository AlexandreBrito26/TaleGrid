package com.talegrid.controller;

import com.talegrid.model.User;
import com.talegrid.service.GeminiService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ImageController {

    private final GeminiService geminiService;

    @PostMapping("/api/stories/{storyId}/chapters/{chapterId}/images")
    public ResponseEntity<GenerateResponse> generate(
            @PathVariable UUID storyId,
            @PathVariable UUID chapterId,
            @RequestBody GenerateRequest req,
            @AuthenticationPrincipal User author) throws IOException {

        String imageUrl  = geminiService.generateForChapter(chapterId, req.prompt(), author);
        int imagesNow    = geminiService.getImagesCountForChapter(chapterId);
        return ResponseEntity.ok(new GenerateResponse(imageUrl, imagesNow, 3, imagesNow >= 3));
    }

    @GetMapping("/api/ai/quota")
    public ResponseEntity<GeminiService.QuotaInfo> quota(@AuthenticationPrincipal User author) {
        return ResponseEntity.ok(geminiService.getQuotaInfo(author.getId()));
    }

    record GenerateRequest(
        @NotBlank @Size(min = 10, max = 500) String prompt
    ) {}

    record GenerateResponse(String imageUrl, int imagesInChapter, int maxImages, boolean limitReached) {}
}
