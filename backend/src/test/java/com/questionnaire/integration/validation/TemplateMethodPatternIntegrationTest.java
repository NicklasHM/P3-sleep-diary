package com.questionnaire.integration.validation;

import com.questionnaire.exception.ValidationException;
import com.questionnaire.model.Question;
import com.questionnaire.model.Questionnaire;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.model.QuestionType;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import com.questionnaire.service.QuestionFinder;
import com.questionnaire.validation.UnifiedQuestionnaireValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootTest
@DisplayName("UnifiedQuestionnaireValidator integration (template flow)")
class TemplateMethodPatternIntegrationTest {
    
    @Autowired
    private UnifiedQuestionnaireValidator validator;
    
    @Autowired
    private IQuestionnaireService questionnaireService;
    
    @Autowired
    private QuestionFinder questionFinder;
    
    @Test
    @DisplayName("Gyldige svar passerer template-flowet")
    void validatesUsingTemplateFlow() {
        Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(QuestionnaireType.morning);
        List<Question> questions = questionnaireService.getQuestionsByQuestionnaireId(questionnaire.getId());
        
        Map<String, Object> answers = createValidAnswersForQuestions(questions);
        
        assertDoesNotThrow(() -> validator.validate(questionnaire.getId(), answers));
    }
    
    @Test
    @DisplayName("LightOff før wentToBed kaster ValidationException")
    void rejectsLightOffBeforeBedTime() {
        Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(QuestionnaireType.morning);
        List<Question> questions = questionnaireService.getQuestionsByQuestionnaireId(questionnaire.getId());
        
        Map<String, Object> answers = createValidAnswersForQuestions(questions);
        
        Question wentToBedQuestion = questionFinder.findByOrderAndType(
            questions, 3, QuestionType.time_picker);
        Question lightOffQuestion = questionFinder.findByOrderAndType(
            questions, 4, QuestionType.time_picker);
        
        if (wentToBedQuestion != null && lightOffQuestion != null) {
            answers.put(wentToBedQuestion.getId(), "22:30");
            answers.put(lightOffQuestion.getId(), "22:00");
        }
        
        assertThrows(ValidationException.class, () -> validator.validate(questionnaire.getId(), answers));
    }
    
    @Test
    @DisplayName("Min/max i base-validering kaster ValidationException")
    void rejectsOutOfRangeNumericValue() {
        Questionnaire questionnaire = questionnaireService.getQuestionnaireByType(QuestionnaireType.morning);
        List<Question> questions = questionnaireService.getQuestionsByQuestionnaireId(questionnaire.getId());
        
        Map<String, Object> answers = new HashMap<>();
        
        for (Question question : questions) {
            if (question.getType() == QuestionType.numeric && question.getMinValue() != null) {
                answers.put(question.getId(), question.getMinValue() - 1);
                break;
            }
        }
        
        if (!answers.isEmpty()) {
            assertThrows(ValidationException.class, () -> validator.validate(questionnaire.getId(), answers));
        }
    }
    
    private Map<String, Object> createValidAnswersForQuestions(List<Question> questions) {
        Map<String, Object> answers = new HashMap<>();
        
        for (Question question : questions) {
            if (question.getType() == QuestionType.time_picker) {
                answers.put(question.getId(), "22:00");
            } else if (question.getType() == QuestionType.numeric) {
                int value = question.getMinValue() != null ? question.getMinValue() : 0;
                answers.put(question.getId(), value);
            } else if (question.getType() == QuestionType.text) {
                answers.put(question.getId(), "Test svar");
            }
        }
        
        Question wentToBedQuestion = questionFinder.findByOrderAndType(
            questions, 3, QuestionType.time_picker);
        Question lightOffQuestion = questionFinder.findByOrderAndType(
            questions, 4, QuestionType.time_picker);
        Question wokeUpQuestion = questionFinder.findByOrderAndType(
            questions, 9, QuestionType.time_picker);
        Question gotUpQuestion = questionFinder.findByOrderAndType(
            questions, 10, QuestionType.time_picker);
        
        if (wentToBedQuestion != null) {
            answers.put(wentToBedQuestion.getId(), "22:00");
        }
        if (lightOffQuestion != null) {
            answers.put(lightOffQuestion.getId(), "22:15"); // Efter wentToBedTime
        }
        if (wokeUpQuestion != null) {
            answers.put(wokeUpQuestion.getId(), "07:00");
        }
        if (gotUpQuestion != null) {
            answers.put(gotUpQuestion.getId(), "07:30"); // Efter wokeUpTime
        }
        
        return answers;
    }
}
