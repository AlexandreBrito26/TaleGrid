package com.talegrid.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talegrid.service.GeminiService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Bean
    public RestTemplate restTemplate() { return new RestTemplate(); }

    @Bean
    public ObjectMapper objectMapper() { return new ObjectMapper(); }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/images/")
                .setCachePeriod(3600 * 24 * 7);
    }
}

@RestControllerAdvice
class QuotaExceptionHandler {
    record ErrorBody(int status, String message, LocalDateTime timestamp) {}

    @ExceptionHandler(GeminiService.QuotaExceededException.class)
    public ResponseEntity<ErrorBody> handle(GeminiService.QuotaExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", "86400")
            .body(new ErrorBody(429, ex.getMessage(), LocalDateTime.now()));
    }
}
