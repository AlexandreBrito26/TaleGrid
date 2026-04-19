package com.talegrid.service;

import com.talegrid.dto.ChapterDto;
import com.talegrid.model.Chapter;
import com.talegrid.model.Story;
import com.talegrid.model.User;
import com.talegrid.repository.ChapterRepository;
import com.talegrid.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final StoryRepository   storyRepository;
    private final PdfExtractionService pdfService;

    // Máximo de imagens IA por capítulo (Fase 4)
    public static final int MAX_AI_IMAGES = 3;

    /**
     * Processa um PDF e cria um capítulo vinculado à história.
     * O PDF é descartado após a extração — apenas o texto é persistido.
     */
    @Transactional
    public ChapterDto.ChapterResponse createFromPdf(UUID storyId,
                                                     String title,
                                                     MultipartFile pdf,
                                                     User author) throws IOException {
        Story story = getStoryOwnedBy(storyId, author);

        // Extrai texto — PDF descartado aqui
        String content = pdfService.extract(pdf);

        int wordCount   = pdfService.countWords(content);
        int readingTime = pdfService.estimateReadingTime(wordCount);
        int nextOrder   = (int) chapterRepository.countByStoryId(storyId) + 1;

        Chapter chapter = new Chapter();
        chapter.setStory(story);
        chapter.setTitle(title);
        chapter.setContent(content);
        chapter.setOrderIndex(nextOrder);
        chapter.setWordCount(wordCount);
        chapter.setReadingTimeMinutes(readingTime);

        chapterRepository.save(chapter);
        return ChapterDto.ChapterResponse.from(chapter, true); // true = incluir conteúdo
    }

    /**
     * Retorna o conteúdo de um capítulo para leitura.
     * Nunca retorna link de download do PDF.
     */
    @Transactional(readOnly = true)
    public ChapterDto.ChapterResponse getForReading(UUID storyId, UUID chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .filter(c -> c.getStory().getId().equals(storyId))
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Capítulo não encontrado."));
        return ChapterDto.ChapterResponse.from(chapter, true);
    }

    /**
     * Lista resumo dos capítulos (sem conteúdo completo — só metadados).
     */
    @Transactional(readOnly = true)
    public List<ChapterDto.ChapterSummary> listByStory(UUID storyId) {
        return chapterRepository.findByStoryIdOrderByOrderIndexAsc(storyId)
            .stream()
            .map(ChapterDto.ChapterSummary::from)
            .toList();
    }

    /**
     * Navegar: próximo ou anterior capítulo.
     */
    @Transactional(readOnly = true)
    public ChapterDto.ChapterResponse getRelative(UUID storyId, UUID chapterId, int delta) {
        Chapter current = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Capítulo não encontrado."));
        int targetIndex = current.getOrderIndex() + delta;
        return chapterRepository.findByStoryIdAndOrderIndex(storyId, targetIndex)
            .map(c -> ChapterDto.ChapterResponse.from(c, true))
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Não há capítulo nessa direção."));
    }

    // ── Privados ────────────────────────────────────────────

    private Story getStoryOwnedBy(UUID storyId, User author) {
        Story story = storyRepository.findById(storyId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("História não encontrada."));
        if (!story.getAuthor().getId().equals(author.getId())) {
            throw new AccessDeniedException("Você não é o autor desta história.");
        }
        return story;
    }
}
