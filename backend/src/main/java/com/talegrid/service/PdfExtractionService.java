package com.talegrid.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * Extrai texto puro de PDFs usando Apache PDFBox.
 *
 * PROTEÇÃO DE AUTORIA:
 * - Recebe o MultipartFile apenas em memória (nunca salva no disco).
 * - Retorna somente o texto extraído — o PDF original é descartado.
 * - O front-end jamais recebe um link ou stream do PDF.
 */
@Service
public class PdfExtractionService {

    // Quebras de linha excessivas (3+) → 2
    private static final Pattern EXCESS_NEWLINES = Pattern.compile("\\n{3,}");
    // Hifenização de final de linha (palavra-\npalavra) → junta
    private static final Pattern HYPHEN_BREAK    = Pattern.compile("(\\w)-\\n(\\w)");
    // Espaços múltiplos → um
    private static final Pattern MULTI_SPACE     = Pattern.compile("[ \\t]{2,}");
    // Números de página isolados (linhas com só dígitos)
    private static final Pattern PAGE_NUMBER     = Pattern.compile("(?m)^\\s*\\d+\\s*$");

    /**
     * Extrai e sanitiza o texto de um arquivo PDF.
     *
     * @param file MultipartFile enviado pelo autor
     * @return Texto puro formatado, pronto para ser armazenado
     * @throws IOException se o PDF for inválido ou corrompido
     * @throws IllegalArgumentException se o arquivo não for PDF
     */
    public String extract(MultipartFile file) throws IOException {
        validatePdf(file);

        // Carrega em memória — NUNCA em disco
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);  // mantém ordem de leitura
            stripper.setLineSeparator("\n");
            String raw = stripper.getText(doc);
            return sanitize(raw);
        }
    }

    /**
     * Conta palavras no texto (para estimativa de tempo de leitura).
     */
    public int countWords(String text) {
        if (text == null || text.isBlank()) return 0;
        return text.trim().split("\\s+").length;
    }

    /**
     * Estima tempo de leitura em minutos (200 palavras/min = leitura média).
     */
    public int estimateReadingTime(int wordCount) {
        return Math.max(1, (int) Math.ceil(wordCount / 200.0));
    }

    // ── Privados ────────────────────────────────────────────

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio.");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Somente arquivos .pdf são aceitos.");
        }
        // Verifica magic bytes %PDF
        try {
            byte[] header = new byte[4];
            file.getInputStream().read(header);
            String magic = new String(header);
            if (!magic.startsWith("%PDF")) {
                throw new IllegalArgumentException("Arquivo não é um PDF válido.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Não foi possível ler o arquivo.");
        }
    }

    private String sanitize(String raw) {
        if (raw == null) return "";

        String text = raw;

        // 1. Remove números de página isolados
        text = PAGE_NUMBER.matcher(text).replaceAll("");

        // 2. Junta palavras hifenizadas no fim de linha
        text = HYPHEN_BREAK.matcher(text).replaceAll("$1$2");

        // 3. Normaliza múltiplos espaços
        text = MULTI_SPACE.matcher(text).replaceAll(" ");

        // 4. Reduz quebras de linha excessivas
        text = EXCESS_NEWLINES.matcher(text).replaceAll("\n\n");

        // 5. Remove caracteres de controle (exceto \n e \t)
        text = text.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "");

        return text.strip();
    }
}
