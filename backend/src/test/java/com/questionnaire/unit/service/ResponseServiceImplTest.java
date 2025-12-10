package com.questionnaire.unit.service;

import com.questionnaire.exception.ResponseAlreadyExistsException;
import com.questionnaire.model.QuestionnaireType;
import com.questionnaire.model.ResolvedQuestionnaire;
import com.questionnaire.model.Response;
import com.questionnaire.model.SleepParameters;
import com.questionnaire.repository.QuestionRepository;
import com.questionnaire.repository.ResponseRepository;
import com.questionnaire.service.QuestionnaireResolver;
import com.questionnaire.service.ResponseServiceImpl;
import com.questionnaire.service.interfaces.IQuestionService;
import com.questionnaire.service.interfaces.IQuestionnaireService;
import com.questionnaire.service.interfaces.IResponseValidationService;
import com.questionnaire.service.interfaces.ISleepParameterCalculator;
import com.questionnaire.strategy.DefaultConditionalLogic;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResponseServiceImpl unit-tests (mocked deps)")
class ResponseServiceImplTest {

    @Mock private ResponseRepository responseRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private ISleepParameterCalculator sleepParameterCalculator;
    @Mock private IQuestionnaireService questionnaireService;
    @Mock private IQuestionService questionService;
    @Mock private IResponseValidationService responseValidationService;
    @Mock private DefaultConditionalLogic conditionalLogicStrategy;
    @Mock private QuestionnaireResolver questionnaireResolver;

    @InjectMocks
    private ResponseServiceImpl responseService;

    @Captor
    private ArgumentCaptor<Response> responseCaptor;

    private final Map<String, Object> answers = new HashMap<>();

    @BeforeEach
    void setup() {
        answers.put("q1", "value");
    }

    @Test
    @DisplayName("saveResponse gemmer og beregner søvnparametre for morning")
    void saveResponse_persistsAndCalculatesSleep() {
        ResolvedQuestionnaire resolved = new ResolvedQuestionnaire("qid", QuestionnaireType.morning);
        when(questionnaireResolver.resolveQuestionnaireId("qid")).thenReturn(resolved);
        when(responseRepository.findByUserIdAndQuestionnaireTypeAndDateRange(
                anyString(), any(QuestionnaireType.class), any(Date.class), any(Date.class)))
                .thenReturn(Collections.emptyList());
        when(sleepParameterCalculator.calculate(anyMap(), eq("qid")))
                .thenReturn(new SleepParameters(1, 2, 3, 4));
        when(responseRepository.save(any(Response.class))).thenAnswer(inv -> {
            Response r = inv.getArgument(0);
            r.setId("generated-id");
            return r;
        });

        Response saved = responseService.saveResponse("user-1", "qid", answers);

        verify(responseValidationService).validateResponse(eq("qid"), eq(answers));
        verify(responseRepository).save(responseCaptor.capture());
        Response captured = responseCaptor.getValue();
        assertEquals("user-1", captured.getUserId());
        assertEquals("generated-id", saved.getId());
        assertNotNull(saved.getSleepParameters());
        assertEquals(4, saved.getSleepParameters().getTST());
    }

    @Test
    @DisplayName("saveResponse kaster hvis der allerede er besvaret i dag")
    void saveResponse_rejectsDuplicateSameDay() {
        ResolvedQuestionnaire resolved = new ResolvedQuestionnaire("qid", QuestionnaireType.morning);
        when(questionnaireResolver.resolveQuestionnaireId("qid")).thenReturn(resolved);
        when(responseRepository.findByUserIdAndQuestionnaireTypeAndDateRange(
                anyString(), any(QuestionnaireType.class), any(Date.class), any(Date.class)))
                .thenReturn(List.of(new Response()));

        assertThrows(ResponseAlreadyExistsException.class,
                () -> responseService.saveResponse("user-1", "qid", answers));

        verify(responseRepository, never()).save(any());
    }

    @Test
    @DisplayName("hasResponseForToday returnerer true når der findes svar i interval")
    void hasResponseForToday_detectsExisting() {
        when(responseRepository.findByUserIdAndQuestionnaireTypeAndDateRange(
                eq("user-1"), eq(QuestionnaireType.morning), any(Date.class), any(Date.class)))
                .thenReturn(List.of(new Response()));

        boolean result = responseService.hasResponseForToday("user-1", QuestionnaireType.morning);

        assertTrue(result);
    }
}

