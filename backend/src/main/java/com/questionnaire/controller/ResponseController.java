package com.questionnaire.controller;

import com.questionnaire.dto.NextQuestionRequest;
import com.questionnaire.dto.ResponseRequest;
import com.questionnaire.model.Question;
import com.questionnaire.model.Response;
import com.questionnaire.model.User;
import com.questionnaire.service.interfaces.IResponseService;
import com.questionnaire.service.interfaces.IUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responses")
public class ResponseController {

    @Autowired
    private IResponseService responseService;

    @Autowired
    private IUserService userService;

    @PostMapping
    public ResponseEntity<Response> saveResponse(
            @Valid @RequestBody ResponseRequest request,
            Authentication authentication) {
        if (request == null || authentication == null) {
            return ResponseEntity.badRequest().build();
        }
        String username = authentication.getName();
        if (username == null) {
            return ResponseEntity.badRequest().build();
        }
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bruger ikke fundet"));
        String userId = user.getId();
        
        if (request.getQuestionnaireId() == null || request.getAnswers() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Response response = responseService.saveResponse(
                userId,
                request.getQuestionnaireId(),
                request.getAnswers()
        );

        // Hvis det er morgenskema, beregn søvnparametre (beregnes on-the-fly når det anmodes)

        return ResponseEntity.ok(response);
    }

    @PostMapping("/next")
    public ResponseEntity<Question> getNextQuestion(
            @Valid @RequestBody NextQuestionRequest request,
            @RequestParam(required = false, defaultValue = "da") String language) {
        Question nextQuestion = responseService.getNextQuestion(
                request.getQuestionnaireId(),
                request.getCurrentAnswers(),
                request.getCurrentQuestionId(),
                language
        );

        if (nextQuestion == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(nextQuestion);
    }

    @GetMapping
    public ResponseEntity<List<Response>> getResponses(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String questionnaireId) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Response> responses;
        if (questionnaireId != null && !questionnaireId.trim().isEmpty()) {
            responses = responseService.getResponsesByUserIdAndQuestionnaireId(userId, questionnaireId);
        } else {
            responses = responseService.getResponsesByUserId(userId);
        }
        
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/check-today")
    public ResponseEntity<Map<String, Boolean>> checkResponseForToday(
            @RequestParam String questionnaireType,
            Authentication authentication) {
        if (questionnaireType == null || questionnaireType.trim().isEmpty() || authentication == null) {
            return ResponseEntity.badRequest().build();
        }
        
        String username = authentication.getName();
        if (username == null) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bruger ikke fundet"));
        
        com.questionnaire.model.QuestionnaireType type;
        try {
            type = com.questionnaire.model.QuestionnaireType.valueOf(questionnaireType.toLowerCase());
        } catch (IllegalArgumentException e) {
            Map<String, Boolean> errorResult = new HashMap<>();
            errorResult.put("error", true);
            return ResponseEntity.badRequest().body(errorResult);
        }
        boolean hasResponse = responseService.hasResponseForToday(user.getId(), type);
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("hasResponse", hasResponse);
        
        return ResponseEntity.ok(result);
    }
}

