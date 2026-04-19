package com.talegrid.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talegrid.model.Chapter;
import com.talegrid.model.ImageGenerationLog;
import com.talegrid.model.User;
import com.talegrid.repository.ChapterRepository;
import com.talegrid.repository.ImageGenerationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final ImageGenerationLogRepository logRepo;
    private final ChapterRepository            chapterRepo;
    private final ObjectMapper                 objectMapper;
    private final RestTemplate                 restTemplate;

    @Value("${talegrid.gemini.api-key}")
    private String apiKey;

    @Value("${talegrid.gemini.max-images-per-chapter:3}")
    private int maxImagesPerChapter;

    @Value("${talegrid.gemini.daily-limit:100}")
    private int dailyLimit;

    @Value("${talegrid.gemini.image-storage-dir:uploads/images/}")
    private String imageStorageDir;

    private static final String IMAGEN_ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

    @Transactional
    public String generateForChapter(UUID chapterId, String customPrompt, User author) throws IOException {
        // Trava 1 — por capítulo
        long inChapter = logRepo.countByChapterId(chapterId);
        if (inChapter >= maxImagesPerChapter)
            throw new QuotaExceededException("Este capítulo já possui " + maxImagesPerChapter + " imagem(ns).");

        // Trava 2 — diária global
        long today = logRepo.countByGenerationDate(LocalDate.now());
        if (today >= dailyLimit)
            throw new QuotaExceededException("Limite diário de " + dailyLimit + " imagens atingido.");

        Chapter chapter = chapterRepo.findById(chapterId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Capítulo não encontrado."));

        String prompt   = buildPrompt(chapter, customPrompt);
        String base64   = callImagenApi(prompt);
        String imageUrl = saveImage(base64);

        chapter.getAiImageUrls().add(imageUrl);
        chapterRepo.save(chapter);

        ImageGenerationLog entry = new ImageGenerationLog();
        entry.setAuthor(author);
        entry.setChapter(chapter);
        entry.setImageUrl(imageUrl);
        entry.setPromptUsed(prompt);
        entry.setGenerationDate(LocalDate.now());
        logRepo.save(entry);

        return imageUrl;
    }

    public QuotaInfo getQuotaInfo(UUID authorId) {
        long todayGlobal = logRepo.countByGenerationDate(LocalDate.now());
        long todayAuthor = logRepo.countByAuthorIdAndGenerationDate(authorId, LocalDate.now());
        return new QuotaInfo((int) todayGlobal, dailyLimit,
            dailyLimit - (int) todayGlobal, (int) todayAuthor, maxImagesPerChapter);
    }

    public int getImagesCountForChapter(UUID chapterId) {
        return (int) logRepo.countByChapterId(chapterId);
    }

    private String buildPrompt(Chapter chapter, String custom) {
        return "Fantasy RPG illustration, cinematic lighting, highly detailed digital painting, " +
               "dark fantasy atmosphere. Scene: " + custom.trim() +
               ". Style: epic fantasy art. Chapter: \"" + chapter.getTitle() + "\".";
    }

    private String callImagenApi(String prompt) throws IOException {
        String url = IMAGEN_ENDPOINT + "?key=" + apiKey;
        ObjectNode body = objectMapper.createObjectNode();
        body.putArray("instances").addObject().put("prompt", prompt);
        ObjectNode params = body.putObject("parameters");
        params.put("sampleCount", 1);
        params.put("aspectRatio", "16:9");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> resp = restTemplate.exchange(
            url, HttpMethod.POST,
            new HttpEntity<>(objectMapper.writeValueAsString(body), headers),
            String.class);

        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null)
            throw new IOException("Gemini API status: " + resp.getStatusCode());

        JsonNode img = objectMapper.readTree(resp.getBody())
            .path("predictions").path(0).path("bytesBase64Encoded");
        if (img.isMissingNode()) throw new IOException("Gemini não retornou imagem.");
        return img.asText();
    }

    private String saveImage(String base64) throws IOException {
        String filename = UUID.randomUUID() + ".png";
        Path dir  = Paths.get(imageStorageDir);
        Path file = dir.resolve(filename);
        Files.createDirectories(dir);
        Files.write(file, Base64.getDecoder().decode(base64));
        return "/images/" + filename;
    }

    public record QuotaInfo(int usedToday, int dailyLimit, int remaining, int usedByAuthorToday, int maxPerChapter) {}

    public static class QuotaExceededException extends RuntimeException {
        public QuotaExceededException(String msg) { super(msg); }
    }
}
