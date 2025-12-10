package com.questionnaire.unit.service;

import com.questionnaire.model.Question;
import com.questionnaire.model.Questionnaire;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.repository.QuestionnaireRepository;
import com.questionnaire.service.QuestionnaireServiceImpl;
import com.questionnaire.service.interfaces.IQuestionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionnaireServiceImpl unit-tests")
class QuestionnaireServiceImplTest {

    @Mock private QuestionnaireRepository questionnaireRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private IQuestionService questionService;

    @InjectMocks
    private QuestionnaireServiceImpl questionnaireService;

    @Test
    @DisplayName("getQuestionnaireByType returnerer fundet questionnaire")
    void getQuestionnaireByType_returnsFound() {
        Questionnaire q = new Questionnaire(QuestionnaireType.morning, "Morgen");
        when(questionnaireRepository.findByType(QuestionnaireType.morning)).thenReturn(Optional.of(q));

        Questionnaire result = questionnaireService.getQuestionnaireByType(QuestionnaireType.morning);

        assertEquals(q, result);
    }

    @Test
    @DisplayName("getQuestionnaireByType kaster når ikke fundet")
    void getQuestionnaireByType_throwsWhenMissing() {
        when(questionnaireRepository.findByType(QuestionnaireType.evening)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> questionnaireService.getQuestionnaireByType(QuestionnaireType.evening));
    }

    @Test
    @DisplayName("getQuestionsByQuestionnaireId returnerer sorterede spørgsmål")
    void getQuestionsByQuestionnaireId_returnsList() {
        Question q1 = new Question();
        Question q2 = new Question();
        when(questionRepository.findByQuestionnaireIdOrderByOrderAsc(anyString()))
                .thenReturn(List.of(q1, q2));

        List<Question> result = questionnaireService.getQuestionsByQuestionnaireId("qid");

        assertEquals(2, result.size());
        assertEquals(q1, result.get(0));
    }
}

