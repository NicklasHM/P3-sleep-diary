package com.questionnaire.integration.validation;

import com.questionnaire.exception.ValidationException;
import com.questionnaire.model.Question;
import com.questionnaire.model.QuestionType;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.service.QuestionFinder;
import com.questionnaire.validation.MultipleChoiceAnswerValidator;
import com.questionnaire.validation.NumericAnswerValidator;
import com.questionnaire.validation.TextAnswerValidator;
import com.questionnaire.validation.TimeAnswerValidator;
import com.questionnaire.validation.UnifiedQuestionnaireValidator;
import com.questionnaire.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Smal integrationstest af UnifiedQuestionnaireValidator med mock'et repo
 * og et lille datasæt (2–3 spørgsmål). Ingen sleep calc/response-save.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UnifiedQuestionnaireValidator smal integrationstest")
class QuestionnaireValidatorIntegrationTest {

    @Mock
    private QuestionRepository questionRepository;

    private UnifiedQuestionnaireValidator validator;
    private List<Question> questions;

    @BeforeEach
    void setup() {
        ValidatorFactory factory = new ValidatorFactory(
                new TextAnswerValidator(),
                new NumericAnswerValidator(),
                new TimeAnswerValidator(),
                new MultipleChoiceAnswerValidator()
        );
        QuestionFinder finder = new QuestionFinder();
        validator = new UnifiedQuestionnaireValidator(factory, null, finder, questionRepository);

        questions = Arrays.asList(
                question("q3", 3, QuestionType.time_picker),
                question("q4", 4, QuestionType.time_picker),
                numericQuestion("q5", 5, 0, 10)
        );

        when(questionRepository.findByQuestionnaireIdOrderByOrderAsc(eq("qid"))).thenReturn(questions);
    }

    @Test
    @DisplayName("Gyldige tider accepteres")
    void acceptsValidTimes() {
        Map<String, Object> answers = new HashMap<>();
        answers.put("q3", "22:00");
        answers.put("q4", "22:15");
        answers.put("q5", 5);

        assertDoesNotThrow(() -> validator.validate("qid", answers));
    }

    @Test
    @DisplayName("LightOff før wentToBed kaster ValidationException")
    void rejectsInvalidTimes() {
        Map<String, Object> answers = new HashMap<>();
        answers.put("q3", "22:30");
        answers.put("q4", "22:00");

        assertThrows(ValidationException.class, () -> validator.validate("qid", answers));
    }

    @Test
    @DisplayName("Numeric min/max håndhæves")
    void enforcesNumericBounds() {
        Map<String, Object> answers = new HashMap<>();
        answers.put("q3", "22:00");
        answers.put("q4", "22:15");
        answers.put("q5", -1); // under min

        assertThrows(ValidationException.class, () -> validator.validate("qid", answers));
    }

    // Helpers
    private Question question(String id, int order, QuestionType type) {
        Question q = new Question();
        q.setId(id);
        q.setOrder(order);
        q.setType(type);
        return q;
    }

    private Question numericQuestion(String id, int order, int min, int max) {
        Question q = question(id, order, QuestionType.numeric);
        q.setMinValue(min);
        q.setMaxValue(max);
        return q;
    }
}
