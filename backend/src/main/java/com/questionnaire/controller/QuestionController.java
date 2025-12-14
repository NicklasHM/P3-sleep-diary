package com.questionnaire.controller;

import com.questionnaire.model.Question;
import com.questionnaire.service.interfaces.IQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private IQuestionService questionService;

    @PostMapping
    @PreAuthorize("hasRole('RÅDGIVER')")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        Question created = questionService.createQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RÅDGIVER')")
    public ResponseEntity<Question> updateQuestion(@PathVariable String id, @RequestBody Question question) {
        Question updated = questionService.updateQuestion(id, question);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RÅDGIVER')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Question>> getQuestions(
            @RequestParam(required = false) String questionnaireId,
            @RequestParam(required = false, defaultValue = "da") String language,
            @RequestParam(required = false, defaultValue = "false") boolean includeDeleted) {
        if (questionnaireId != null) {
            List<Question> questions;
            if (includeDeleted) {
                questions = questionService.findByQuestionnaireIdIncludingDeleted(questionnaireId, language);
            } else {
                questions = questionService.findByQuestionnaireId(questionnaireId, language);
            }
            return ResponseEntity.ok(questions);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestion(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "da") String language,
            @RequestParam(required = false, defaultValue = "false") boolean includeDeleted) {
        try {
            Question question;
            if (includeDeleted) {
                question = questionService.findByIdIncludingDeleted(id, language);
            } else {
                question = questionService.findById(id, language);
            }
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/conditional")
    @PreAuthorize("hasRole('RÅDGIVER')")
    public ResponseEntity<Question> addConditionalChild(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        String optionId = request.get("optionId");
        String childQuestionId = request.get("childQuestionId");
        if (optionId == null || childQuestionId == null) {
            return ResponseEntity.badRequest().build();
        }
        Question updated = questionService.addConditionalChild(id, optionId, childQuestionId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/conditional")
    @PreAuthorize("hasRole('RÅDGIVER')")
    public ResponseEntity<Question> removeConditionalChild(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        String optionId = request.get("optionId");
        String childQuestionId = request.get("childQuestionId");
        if (optionId == null || childQuestionId == null) {
            return ResponseEntity.badRequest().build();
        }
        Question updated = questionService.removeConditionalChild(id, optionId, childQuestionId);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/conditional/order")
    @PreAuthorize("hasRole('RÅDGIVER')")
    public ResponseEntity<Question> updateConditionalChildrenOrder(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        String optionId = (String) request.get("optionId");
        @SuppressWarnings("unchecked")
        List<String> childQuestionIds = (List<String>) request.get("childQuestionIds");
        if (optionId == null || childQuestionIds == null) {
            return ResponseEntity.badRequest().build();
        }
        Question updated = questionService.updateConditionalChildrenOrder(id, optionId, childQuestionIds);
        return ResponseEntity.ok(updated);
    }
}

