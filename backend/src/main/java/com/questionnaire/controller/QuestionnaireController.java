package com.questionnaire.controller;

import com.questionnaire.model.Question;
import com.questionnaire.model.Questionnaire;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questionnaires")
public class QuestionnaireController {

    @Autowired
    private IQuestionnaireService questionnaireService;

    @GetMapping("/{type}")
    public ResponseEntity<Questionnaire> getQuestionnaire(@PathVariable String type) {
        if (type == null || type.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            QuestionnaireType questionnaireType = QuestionnaireType.valueOf(type.toLowerCase());
            Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(questionnaireType);
            return ResponseEntity.ok(questionnaire);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{type}/start")
    public ResponseEntity<List<Question>> startQuestionnaire(
            @PathVariable String type,
            @RequestParam(required = false, defaultValue = "da") String language) {
        if (type == null || type.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            QuestionnaireType questionnaireType = QuestionnaireType.valueOf(type.toLowerCase());
            Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(questionnaireType);
            List<Question> questions = questionnaireService.getQuestionsByQuestionnaireId(questionnaire.getId(), language);
            
            // Returner kun første spørgsmål
            if (!questions.isEmpty()) {
                return ResponseEntity.ok(List.of(questions.get(0)));
            }
            return ResponseEntity.ok(List.of());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}





