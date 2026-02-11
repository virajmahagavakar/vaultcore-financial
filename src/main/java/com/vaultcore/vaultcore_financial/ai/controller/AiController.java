package com.vaultcore.vaultcore_financial.ai.controller;

import com.vaultcore.vaultcore_financial.ai.dto.ChatRequest;
import com.vaultcore.vaultcore_financial.ai.dto.ChatResponse;
import com.vaultcore.vaultcore_financial.ai.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = geminiService.getChatResponse(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
