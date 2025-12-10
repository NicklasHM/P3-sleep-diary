package com.questionnaire.unit.strategy;

import com.questionnaire.model.Question;
import com.questionnaire.model.QuestionType;
import com.questionnaire.strategy.DefaultConditionalLogic;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("DefaultConditionalLogic unit-tests")
class DefaultConditionalLogicTest {

    private final DefaultConditionalLogic strategy = new DefaultConditionalLogic();

    @Test
    @DisplayName("Returnerer spørgsmålet når ingen condition er opfyldt")
    void returnsQuestionWithoutConditions() {
        Question question = buildQuestion("q1", 1, QuestionType.numeric);
        List<Question> questions = new ArrayList<>();
        questions.add(question);

        Question result = strategy.shouldShow(question, new HashMap<>(), questions, question.getId());

        assertNotNull(result);
        assertEquals(question.getId(), result.getId());
    }

    @Test
    @DisplayName("Håndterer manglende svar uden at fejle")
    void handlesMissingAnswers() {
        Question question = buildQuestion("q2", 2, QuestionType.multiple_choice);
        List<Question> questions = List.of(question);

        Question result = strategy.shouldShow(question, new HashMap<>(), questions, question.getId());

        assertNotNull(result);
    }

    @Test
    @DisplayName("Returnerer samme spørgsmål uanset tidligere spørgsmål")
    void ignoresLastQuestionId() {
        Question question = buildQuestion("q3", 3, QuestionType.text);
        List<Question> questions = List.of(question);
        Map<String, Object> answers = new HashMap<>();
        answers.put("other", "value");

        Question result = strategy.shouldShow(question, answers, questions, "previous");

        assertNotNull(result);
        assertEquals(question.getId(), result.getId());
    }

    private Question buildQuestion(String id, int order, QuestionType type) {
        Question question = new Question();
        question.setId(id);
        question.setOrder(order);
        question.setType(type);
        return question;
    }
}

